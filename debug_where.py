import subprocess
import os

print("--- DIRECT SUBPROCESS TEST ---")
cmd = ["where.exe", "/r", "D:\\", "*admit*card*"]
print(f"Running: {cmd}")
proc = subprocess.run(cmd, capture_output=True, text=True)
print(f"STDOUT: {proc.stdout}")
print(f"STDERR: {proc.stderr}")
print(f"RETURNCODE: {proc.returncode}")

print("\n--- CMD TEST ---")
cmd_str = 'cmd /c "where /r D:\\ *admit*card*"'
print(f"Running: {cmd_str}")
proc2 = subprocess.run(cmd_str, capture_output=True, text=True, shell=True)
print(f"STDOUT: {proc2.stdout}")
print(f"STDERR: {proc2.stderr}")
