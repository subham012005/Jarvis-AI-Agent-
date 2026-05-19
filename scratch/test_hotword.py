import openwakeword
from openwakeword.model import Model
import os

model_path = os.path.abspath("hey_jarvis.onnx")
print(f"Loading model from {model_path}")

try:
    # Try loading the model directly from the file path
    oww_model = Model(wakeword_models=[model_path])
    print("Successfully loaded model!")
    print(f"Model keys: {oww_model.models.keys()}")
except Exception as e:
    print(f"Error loading model: {e}")
