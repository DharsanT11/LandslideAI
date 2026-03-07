"""
Train the landslide prediction ML model.

Uses Random Forest, LSTM, and MLP Neural Network in a Voting ensemble.
Run this script to generate model.pkl.
"""
import os
import sys
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier, VotingClassifier
from app.ml.lstm_model import LSTMClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, accuracy_score, roc_auc_score
from sklearn.pipeline import Pipeline
import joblib

# Resolve paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(SCRIPT_DIR, '..', '..', '..', 'dataset', 'landslide_data_6000.csv')
MODEL_PATH = os.path.join(SCRIPT_DIR, 'model.pkl')


def train():
    """Train the landslide prediction ensemble model."""
    print("=" * 60)
    print("Landslide Prediction Model — Training")
    print("=" * 60)

    # Load dataset
    dataset_path = os.path.abspath(DATASET_PATH)
    print(f"\nLoading dataset: {dataset_path}")
    df = pd.read_csv(dataset_path)
    print(f"  Samples: {len(df)}")
    print(f"  Features: {list(df.columns[:-1])}")
    print(f"  Landslide events: {df['landslide'].sum()} ({df['landslide'].mean()*100:.1f}%)")

    # Features and labels
    feature_cols = [
        'rainfall', 'soil_moisture', 'humidity', 'temperature', 'slope'
    ]
    X = df[feature_cols].values
    y = df['landslide'].values

    # Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"\n  Train: {len(X_train)} samples")
    print(f"  Test:  {len(X_test)} samples")

    # Build ensemble
    print("\nTraining ensemble model...")

    rf = RandomForestClassifier(
        n_estimators=100,
        max_depth=8,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1,
    )

    lstm = LSTMClassifier(
        hidden_size=32,
        num_layers=1,
        epochs=100,
        lr=0.001,
        batch_size=32,
    )

    mlp = MLPClassifier(
        hidden_layer_sizes=(32,),
        activation='relu',
        solver='adam',
        alpha=0.0001,
        learning_rate='adaptive',
        max_iter=300,
        random_state=42,
    )

    ensemble = VotingClassifier(
        estimators=[('rf', rf), ('lstm', lstm), ('mlp', mlp)],
        voting='soft',  # use probability averaging
    )

    # Wrap in pipeline with scaler
    pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('model', ensemble),
    ])

    # Train
    pipeline.fit(X_train, y_train)
    print("  ✓ Training complete")

    # Evaluate
    y_pred = pipeline.predict(X_test)
    y_proba = pipeline.predict_proba(X_test)[:, 1]

    accuracy = accuracy_score(y_test, y_pred)
    auc = roc_auc_score(y_test, y_proba)

    print(f"\n{'='*60}")
    print(f"  Test Accuracy:  {accuracy*100:.1f}%")
    print(f"  ROC AUC Score:  {auc:.4f}")
    print(f"{'='*60}")
    print(f"\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=['No Landslide', 'Landslide']))

    # Cross-validation
    print("Running 5-fold cross-validation...")
    cv_scores = cross_val_score(pipeline, X, y, cv=5, scoring='accuracy')
    print(f"  CV Accuracy: {cv_scores.mean()*100:.1f}% (±{cv_scores.std()*100:.1f}%)")

    # Save model
    model_path = os.path.abspath(MODEL_PATH)
    joblib.dump(pipeline, model_path)
    size_kb = os.path.getsize(model_path) / 1024
    print(f"\n  ✓ Model saved to: {model_path} ({size_kb:.0f} KB)")
    print(f"  Feature order: {feature_cols}")

    return pipeline


if __name__ == '__main__':
    train()
