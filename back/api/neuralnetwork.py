import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import transforms
from torchvision.datasets import MNIST
from torch.utils.data import DataLoader

class NeuralNetwork(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc1 = nn.Linear(784, 128)
        self.fc2 = nn.Linear(128, 10)

    def forward(self, x):
        x = torch.flatten(x, start_dim=1)
        x = self.fc1(x)
        x = torch.relu(x)
        x = self.fc2(x)
        return x

    def predict(self, x):
        with torch.no_grad():
            logits = self(x)
            return logits.argmax(dim=1)

model = NeuralNetwork()
criterion = nn.CrossEntropyLoss()
optimizer = optim.SGD(model.parameters(), lr=0.01)

dataset = MNIST(
    root="data",
    train=True,
    transform=transforms.ToTensor(),
    download=True
)

dataloader = DataLoader(dataset, batch_size=64, shuffle=True)

def train_model(m, dl, c, o):
    m.train()

    for x, y in dl:
        logits = model(x)
        loss = c(logits, y)

        o.zero_grad()
        loss.backward()
        o.step()
    
    torch.save(model.state_dict(), "model.pth")

def model_pred(tensor_img):
    model.load_state_dict(torch.load("model.pth"))
    model.eval()

    return model.predict(tensor_img)