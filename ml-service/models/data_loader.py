import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import logging
from database.connection import get_db_connection

logger = logging.getLogger(__name__)

class DataLoader:
    """Loads and prepares data from SQL Server for ML models"""
    
    def __init__(self):
        self.db = None
    
    def load_training_data(self):
        """
        Load historical data for model training
        Returns a pandas DataFrame with all necessary features
        """
        query = """
        SELECT 
            s.solicitud_id,
            s.empleado_id,
            s.edad,
            s.genero,
            s.estado_civil,
            s.numero_hijos,
            s.area,
            s.cargo,
            s.antiguedad_anios,
            s.salario,
            s.tipo_contrato,
            s.sede,
            s.dias_ult_ano,
            s.dias_solicitados,
            s.dias_autorizados,
            s.motivo_texto,
            s.tipo_permiso_real,
            s.impacto_area,
            s.impacto_area_numerico,
            s.es_anomala,
            s.resultado_rrhh,
            s.ml_probabilidad_aprobacion,
            s.sanciones_activas,
            s.inasistencias,
            s.fecha_solicitud,
            s.fecha_inicio,
            s.fecha_fin,
            e.fecha_ingreso,
            e.segmento_ml
        FROM solicitudes_permiso s
        INNER JOIN empleados e ON s.empleado_id = e.empleado_id
        WHERE s.resultado_rrhh IN ('AUTORIZADO', 'RECHAZADO')
        ORDER BY s.fecha_solicitud DESC
        """
        
        try:
            with get_db_connection() as db:
                results = db.execute_query(query)
                df = pd.DataFrame(results)
                
                if df.empty:
                    logger.warning("No training data found in database")
                    return df
                
                # Calculate antiguedad_anios if not present
                if 'antiguedad_anios' not in df.columns or df['antiguedad_anios'].isna().any():
                    df['antiguedad_anios'] = df.apply(
                        lambda row: self._calculate_antiguedad(row['fecha_ingreso']) 
                        if pd.isna(row.get('antiguedad_anios')) else row['antiguedad_anios'],
                        axis=1
                    )
                
                logger.info(f"Loaded {len(df)} training samples from database")
                return df
                
        except Exception as e:
            logger.error(f"Failed to load training data: {str(e)}")
            raise
    
    def load_employee_data(self, empleado_id):
        """Load data for a specific employee"""
        query = """
        SELECT 
            empleado_id,
            nombre,
            email,
            edad,
            genero,
            estado_civil,
            numero_hijos,
            area,
            cargo,
            salario,
            tipo_contrato,
            sede,
            fecha_ingreso,
            sanciones_activas,
            inasistencias,
            segmento_ml
        FROM empleados
        WHERE empleado_id = ?
        """
        
        try:
            with get_db_connection() as db:
                results = db.execute_query(query, (empleado_id,))
                if not results:
                    logger.warning(f"Employee {empleado_id} not found")
                    return None
                
                employee = results[0]
                employee['antiguedad_anios'] = self._calculate_antiguedad(employee['fecha_ingreso'])
                employee['dias_ult_ano'] = self._calculate_dias_ultimo_ano(empleado_id)
                
                return employee
                
        except Exception as e:
            logger.error(f"Failed to load employee data: {str(e)}")
            raise
    
    def _calculate_antiguedad(self, fecha_ingreso):
        """Calculate years of service from fecha_ingreso"""
        if not fecha_ingreso:
            return 0
        
        # Handle different date types
        if isinstance(fecha_ingreso, str):
            fecha_ingreso = datetime.strptime(fecha_ingreso, '%Y-%m-%d')
        elif hasattr(fecha_ingreso, 'year'):  # datetime.date or datetime.datetime
            # Convert date to datetime if needed
            if not isinstance(fecha_ingreso, datetime):
                fecha_ingreso = datetime.combine(fecha_ingreso, datetime.min.time())
        
        today = datetime.now()
        years = (today - fecha_ingreso).days / 365.25
        return int(years)
    
    def _calculate_dias_ultimo_ano(self, empleado_id):
        """Calculate total days taken in the last year"""
        query = """
        SELECT COALESCE(SUM(dias_autorizados), 0) as total_dias
        FROM solicitudes_permiso
        WHERE empleado_id = ?
        AND resultado_rrhh = 'AUTORIZADO'
        AND fecha_solicitud >= DATEADD(YEAR, -1, GETDATE())
        """
        
        try:
            with get_db_connection() as db:
                results = db.execute_query(query, (empleado_id,))
                return results[0]['total_dias'] if results else 0
                
        except Exception as e:
            logger.error(f"Failed to calculate dias_ult_ano: {str(e)}")
            return 0
    
    def prepare_prediction_data(self, request_data):
        """
        Prepare data for prediction from a new request
        
        Args:
            request_data: dict with keys: empleado_id, dias_solicitados, motivo_texto, etc.
        
        Returns:
            dict with all features needed for prediction
        """
        empleado_id = request_data.get('empleado_id')
        employee = self.load_employee_data(empleado_id)
        
        if not employee:
            raise ValueError(f"Employee {empleado_id} not found")
        
        # Combine employee data with request data
        prediction_data = {
            **employee,
            'dias_solicitados': request_data.get('dias_solicitados'),
            'motivo_texto': request_data.get('motivo_texto'),
            'fecha_inicio': request_data.get('fecha_inicio'),
            'fecha_fin': request_data.get('fecha_fin')
        }
        
        return prediction_data
