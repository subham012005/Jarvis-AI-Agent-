import os
import sys
from openwakeword.model import Model

base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
model_path = os.path.join(base_dir, "hey_jarvis.onnx")
mel_path = os.path.join(base_dir, "melspectrogram.onnx")
emb_path = os.path.join(base_dir, "embedding.onnx")

print("model_path:", model_path)
print("mel_path:", mel_path)
print("emb_path:", emb_path)

print("model_path exists:", os.path.exists(model_path))
print("mel_path exists:", os.path.exists(mel_path))
print("emb_path exists:", os.path.exists(emb_path))

try:
    oww_model = Model(
        wakeword_models=[model_path], 
        inference_framework="onnx",
        melspec_model_path=mel_path if os.path.exists(mel_path) else None,
        embedding_model_path=emb_path if os.path.exists(emb_path) else None
    )
    print("\nSUCCESS! Successfully loaded openwakeword model with explicit local paths.")
except Exception as e:
    print("\nFAILURE to load openwakeword model:", e)
