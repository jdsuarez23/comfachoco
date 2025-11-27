"""
ML Model Training Pipeline
Trains a RandomForest classifier for leave approval prediction
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, accuracy_score, roc_auc_score
import joblib
import os


def create_sample_data():
    """
    Create sample training data
    In production, this would load from the database
    """
    np.random.seed(42)
    n_samples = 150
    
    data = {
        'edad': np.random.randint(22, 60, n_samples),
        'genero': np.random.choice(['M', 'F'], n_samples),
        'estado_civil': np.random.choice(['SOLTERO', 'CASADO', 'UNION LIBRE'], n_samples),
        'numero_hijos': np.random.randint(0, 4, n_samples),
        'area': np.random.choice(['TECNOLOGIA', 'VENTAS', 'MARKETING', 'FINANZAS', 'OPERACIONES', 'RRHH'], n_samples),
        'cargo': np.random.choice(['JUNIOR', 'SENIOR', 'COORDINADOR', 'GERENTE', 'ANALISTA'], n_samples),
        'antiguedad_anios': np.random.randint(0, 15, n_samples),
        'salario': np.random.uniform(2500000, 10000000, n_samples),
        'tipo_contrato': np.random.choice(['INDEFINIDO', 'TERMINO FIJO'], n_samples, p=[0.7, 0.3]),
        'sede': np.random.choice(['SEDE PRINCIPAL', 'SEDE NORTE', 'SEDE SUR'], n_samples),
        'dias_ult_ano': np.random.randint(0, 20, n_samples),
        'dias_solicitados': np.random.randint(1, 15, n_samples),
        'tipo_permiso_real': np.random.choice(['VACACIONES', 'MEDICO', 'PERSONAL', 'CALAMIDAD', 'ESTUDIO'], n_samples),
        'impacto_area': np.random.choice(['BAJO', 'MEDIO', 'ALTO'], n_samples, p=[0.6, 0.3, 0.1]),
        'sanciones_activas': np.random.choice([0, 1], n_samples, p=[0.85, 0.15]),
        'inasistencias': np.random.randint(0, 8, n_samples)
    }
    
    df = pd.DataFrame(data)
    
    # Create target variable based on business rules
    # Higher probability of approval for:
    # - Low impact
    # - No sanctions
    # - Low absences
    # - Medical/Calamity leave types
    # - Reasonable days requested
    # - Good tenure
    
    df['aprobado'] = 1  # Default approve
    
    # Rejection rules
    df.loc[df['sanciones_activas'] == 1, 'aprobado'] = 0
    df.loc[df['inasistencias'] > 5, 'aprobado'] = 0
    df.loc[(df['dias_solicitados'] > 10) & (df['impacto_area'] == 'ALTO'), 'aprobado'] = 0
    df.loc[(df['dias_solicitados'] > 12) & (df['antiguedad_anios'] < 2), 'aprobado'] = 0
    
    # Special approval for medical/calamity
    df.loc[(df['tipo_permiso_real'].isin(['MEDICO', 'CALAMIDAD'])) & (df['dias_solicitados'] <= 5), 'aprobado'] = 1
    
    # Add some randomness (80% follow rules, 20% random)
    random_mask = np.random.random(n_samples) < 0.2
    df.loc[random_mask, 'aprobado'] = np.random.choice([0, 1], random_mask.sum())
    
    return df


def preprocess_data(df, label_encoders=None, is_training=True):
    """
    Preprocess features for model training/prediction
    """
    df = df.copy()
    
    # Categorical columns to encode
    categorical_cols = ['genero', 'estado_civil', 'area', 'cargo', 'tipo_contrato', 
                       'sede', 'tipo_permiso_real', 'impacto_area']
    
    if is_training:
        # Create and fit label encoders
        label_encoders = {}
        for col in categorical_cols:
            le = LabelEncoder()
            df[col] = le.fit_transform(df[col].astype(str))
            label_encoders[col] = le
    else:
        # Use existing label encoders
        for col in categorical_cols:
            if col in label_encoders:
                # Handle unknown categories
                le = label_encoders[col]
                df[col] = df[col].astype(str).apply(
                    lambda x: le.transform([x])[0] if x in le.classes_ else -1
                )
    
    return df, label_encoders


def train_model():
    """
    Train the ML model and save artifacts
    """
    print("=" * 60)
    print("ML Model Training Pipeline")
    print("=" * 60)
    
    # Create sample data
    print("\n1. Creating sample training data...")
    df = create_sample_data()
    print(f"   ✓ Generated {len(df)} samples")
    print(f"   ✓ Approval rate: {df['aprobado'].mean():.2%}")
    
    # Save sample data
    df.to_csv('sample_data.csv', index=False)
    print("   ✓ Saved to sample_data.csv")
    
    # Separate features and target
    X = df.drop('aprobado', axis=1)
    y = df['aprobado']
    
    # Preprocess
    print("\n2. Preprocessing features...")
    X_processed, label_encoders = preprocess_data(X, is_training=True)
    print(f"   ✓ Encoded {len(label_encoders)} categorical features")
    
    # Split data
    print("\n3. Splitting data...")
    X_train, X_test, y_train, y_test = train_test_split(
        X_processed, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"   ✓ Training set: {len(X_train)} samples")
    print(f"   ✓ Test set: {len(X_test)} samples")
    
    # Train model
    print("\n4. Training RandomForest model...")
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        class_weight='balanced'
    )
    model.fit(X_train, y_train)
    print("   ✓ Model trained successfully")
    
    # Evaluate
    print("\n5. Evaluating model...")
    y_pred = model.predict(X_test)
    y_pred_proba = model.predict_proba(X_test)[:, 1]
    
    accuracy = accuracy_score(y_test, y_pred)
    auc = roc_auc_score(y_test, y_pred_proba)
    
    print(f"   ✓ Accuracy: {accuracy:.4f}")
    print(f"   ✓ AUC-ROC: {auc:.4f}")
    print("\n   Classification Report:")
    print(classification_report(y_test, y_pred, target_names=['Rechazado', 'Aprobado']))
    
    # Feature importance
    print("\n6. Feature Importance (Top 10):")
    feature_importance = pd.DataFrame({
        'feature': X_processed.columns,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    for idx, row in feature_importance.head(10).iterrows():
        print(f"   {row['feature']:25s}: {row['importance']:.4f}")
    
    # Save model and encoders
    print("\n7. Saving model artifacts...")
    joblib.dump(model, 'model.pkl')
    joblib.dump(label_encoders, 'label_encoders.pkl')
    print("   ✓ Saved model.pkl")
    print("   ✓ Saved label_encoders.pkl")
    
    print("\n" + "=" * 60)
    print("✓ Training completed successfully!")
    print("=" * 60)
    
    return model, label_encoders


if __name__ == '__main__':
    train_model()
