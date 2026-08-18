import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import TensorDataset, DataLoader


class LSTMModel(nn.Module):
    def __init__(self, input_size, hidden_size=64, num_layers=2, dropout=0.2):
        super().__init__()

        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout
        )

        self.fc = nn.Linear(hidden_size, 1)

    def forward(self, x):
        output, _ = self.lstm(x)
        output = output[:, -1, :]
        output = self.fc(output)

        return output.squeeze()


def create_sequences(data, targets, sequence_length=7):
    X = []
    y = []

    for i in range(sequence_length, len(data)):
        X.append(data[i-sequence_length:i])
        y.append(targets[i])

    return np.array(X), np.array(y)


def train_lstm(
    X_train,
    y_train,
    input_size,
    epochs=10,
    batch_size=64,
    learning_rate=0.001
):
    X_tensor = torch.tensor(X_train, dtype=torch.float32)
    y_tensor = torch.tensor(y_train, dtype=torch.float32)

    dataset = TensorDataset(X_tensor, y_tensor)

    loader = DataLoader(
        dataset,
        batch_size=batch_size,
        shuffle=False
    )

    model = LSTMModel(input_size)

    criterion = nn.MSELoss()

    optimizer = torch.optim.Adam(
        model.parameters(),
        lr=learning_rate
    )

    model.train()

    for _ in range(epochs):
        for X_batch, y_batch in loader:
            optimizer.zero_grad()

            predictions = model(X_batch)

            loss = criterion(
                predictions,
                y_batch
            )

            loss.backward()
            optimizer.step()

    return model


def predict_lstm(model, X_test):
    model.eval()

    X_tensor = torch.tensor(
        X_test,
        dtype=torch.float32
    )

    with torch.no_grad():
        predictions = model(X_tensor).numpy()

    return predictions