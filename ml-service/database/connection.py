import pyodbc
import logging
from config import Config

logger = logging.getLogger(__name__)

class DatabaseConnection:
    """Manages database connections to SQL Server"""
    
    def __init__(self):
        self.connection_string = Config.DB_CONNECTION_STRING
        self.connection = None
    
    def connect(self):
        """Establish database connection"""
        try:
            self.connection = pyodbc.connect(self.connection_string)
            logger.info("Database connection established successfully")
            return self.connection
        except Exception as e:
            logger.error(f"Failed to connect to database: {str(e)}")
            raise
    
    def disconnect(self):
        """Close database connection"""
        if self.connection:
            self.connection.close()
            logger.info("Database connection closed")
    
    def execute_query(self, query, params=None):
        """Execute a SELECT query and return results"""
        try:
            cursor = self.connection.cursor()
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            
            columns = [column[0] for column in cursor.description]
            results = []
            for row in cursor.fetchall():
                results.append(dict(zip(columns, row)))
            
            cursor.close()
            return results
        except Exception as e:
            logger.error(f"Query execution failed: {str(e)}")
            raise
    
    def execute_non_query(self, query, params=None):
        """Execute an INSERT/UPDATE/DELETE query"""
        try:
            cursor = self.connection.cursor()
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            
            self.connection.commit()
            cursor.close()
            logger.info("Non-query executed successfully")
        except Exception as e:
            self.connection.rollback()
            logger.error(f"Non-query execution failed: {str(e)}")
            raise
    
    def __enter__(self):
        """Context manager entry"""
        self.connect()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit"""
        self.disconnect()

def get_db_connection():
    """Helper function to get a database connection"""
    return DatabaseConnection()
