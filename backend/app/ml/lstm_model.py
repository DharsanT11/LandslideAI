"""
LSTM (Long Short-Term Memory) classifier with sklearn-compatible interface.

Treats 9 input features as a grouped sequence of 3 timesteps:
  Step 1: [rainfall, humidity, temperature]       — Weather
  Step 2: [soil_moisture, slope_angle, elevation]  — Terrain
  Step 3: [rainfall_3h, rainfall_trend, wind_speed] — Trends

This allows the LSTM memory cells to learn temporal-like patterns
across weather → terrain → trend progression.
"""
import numpy as np
import torch
import torch.nn as nn
from sklearn.base import BaseEstimator, ClassifierMixin


class _LSTMNet(nn.Module):
    """PyTorch LSTM network."""

    def __init__(self, input_size=1, hidden_size=32, num_layers=1, num_classes=2):
        super().__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_size, num_classes)

    def forward(self, x):
        # x shape: (batch, seq_len=3, features=3)
        h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size)
        c0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size)
        out, _ = self.lstm(x, (h0, c0))
        # Take last timestep output
        out = self.fc(out[:, -1, :])
        return out


class LSTMClassifier(BaseEstimator, ClassifierMixin):
    """
    Sklearn-compatible LSTM classifier.

    Wraps a PyTorch LSTM so it can be used inside sklearn's
    VotingClassifier with fit(), predict(), and predict_proba().
    """

    _estimator_type = "classifier"

    def __init__(self, hidden_size=32, num_layers=1, epochs=100, lr=0.001, batch_size=32):
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        self.epochs = epochs
        self.lr = lr
        self.batch_size = batch_size
        self.net_ = None

    def __sklearn_tags__(self):
        """Tell sklearn 1.8+ that this is a classifier."""
        tags = super().__sklearn_tags__()
        tags.estimator_type = "classifier"
        try:
            from sklearn.utils._tags import ClassifierTags
            tags.classifier_tags = ClassifierTags()
        except ImportError:
            pass
        tags.target_tags.required = True
        return tags

    def _reshape_to_sequence(self, X):
        """Reshape (n, 5) flat features into (n, 5, 1) sequences — each feature is a timestep."""
        n = X.shape[0]
        num_features = X.shape[1]
        return X.reshape(n, num_features, 1)

    def fit(self, X, y):
        """Train the LSTM on the provided data."""
        self.classes_ = np.unique(y)
        X_seq = self._reshape_to_sequence(np.array(X, dtype=np.float32))
        y_arr = np.array(y, dtype=np.int64)

        self.net_ = _LSTMNet(
            input_size=1,
            hidden_size=self.hidden_size,
            num_layers=self.num_layers,
        )
        optimizer = torch.optim.Adam(self.net_.parameters(), lr=self.lr)
        criterion = nn.CrossEntropyLoss()

        X_tensor = torch.FloatTensor(X_seq)
        y_tensor = torch.LongTensor(y_arr)

        dataset = torch.utils.data.TensorDataset(X_tensor, y_tensor)
        loader = torch.utils.data.DataLoader(
            dataset, batch_size=self.batch_size, shuffle=True
        )

        self.net_.train()
        for epoch in range(self.epochs):
            for batch_X, batch_y in loader:
                optimizer.zero_grad()
                outputs = self.net_(batch_X)
                loss = criterion(outputs, batch_y)
                loss.backward()
                optimizer.step()

        return self

    def predict(self, X):
        """Predict class labels."""
        proba = self.predict_proba(X)
        return np.argmax(proba, axis=1)

    def predict_proba(self, X):
        """Predict class probabilities."""
        X_seq = self._reshape_to_sequence(np.array(X, dtype=np.float32))
        self.net_.eval()
        with torch.no_grad():
            outputs = self.net_(torch.FloatTensor(X_seq))
            proba = torch.softmax(outputs, dim=1).numpy()
        return proba
