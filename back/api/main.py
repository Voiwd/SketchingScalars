from PIL import Image
from torchvision import transforms
from neuralnetwork import model_pred
from fastapi import FastAPI, File, UploadFile
import io

### Constants

transform = transforms.Compose([
    transforms.Resize((28, 28)),
    transforms.Grayscale(num_output_channels=1),
    transforms.ToTensor(),
])


### Runtime

app = FastAPI()

@app.post("/query")
async def predict(file: UploadFile = File(...)):
    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes))

    return {
        "status" : "received"
    }