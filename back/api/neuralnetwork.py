import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import transforms
from torchvision.datasets import MNIST
from torch.utils.data import DataLoader
from PIL import Image

class NeuralNetwork(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc1 = nn.Linear(784, 128)
        self.fc2 = nn.Linear(128, 64)
        self.fc3 = nn.Linear(64, 10)

    def forward(self, x):
        x = torch.flatten(x, start_dim=1)
        x = self.fc1(x)
        x = torch.relu(x)
        x = self.fc2(x)
        x = torch.relu(x)
        x = self.fc3(x)
        return x

    def predict(self, x):
        with torch.no_grad():
            logits = self(x)
            return logits.argmax(dim=1)

model = NeuralNetwork()
criterion = nn.CrossEntropyLoss()
optimizer = optim.SGD(model.parameters(), lr=0.2)

dataset = MNIST(
    root="data",
    train=True,
    transform=transforms.ToTensor(),
    download=True
)

dataloader = DataLoader(dataset, batch_size=64, shuffle=True)

def train_model(m, dl, c, o, e):
    m.train()

    for i in range(e):  # Train for e epochs
        print(f"Epoch {i+1}/{e}")
        for x, y in dl:
            logits = model(x)
            loss = c(logits, y)

            o.zero_grad()
            loss.backward()
            o.step()

        
    torch.save(model.state_dict(), "model.pth")

def model_pred(tensor_img):
    model.load_state_dict(torch.load("back/api/model.pth"))

    return model.predict(tensor_img)

train_model(model, dataloader, criterion, optimizer, 15)
img = Image.open("eg.png")

transform = transforms.Compose([
    transforms.Resize((28, 28)),
    transforms.Grayscale(num_output_channels=1),
    transforms.ToTensor(),
])

img = transform(img)

pred = model_pred(img)
print(f"Prediction: {pred.item()}")