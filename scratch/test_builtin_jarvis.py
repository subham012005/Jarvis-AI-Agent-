import os
import sys
from openwakeword.model import Model

base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
mel_path = os.path.join(base_dir, "melspectrogram.onnx")
emb_path = os.path.join(base_dir, "embedding.onnx")

print("Attempting to load built-in 'hey_jarvis' model from openwakeword...")
try:
    oww_model = Model(
        wakeword_models=["hey_jarvis"],
        inference_framework="onnx",
        melspec_model_path=mel_path if os.path.exists(mel_path) else None,
        embedding_model_path=emb_path if os.path.exists(emb_path) else None
    )
    print("SUCCESS! Built-in 'hey_jarvis' loaded!")
    print("Model keys:", list(oww_model.models.keys()))
except Exception as e:
    print("Failed to load built-in model:", e)
