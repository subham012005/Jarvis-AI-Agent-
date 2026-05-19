import os
import sys
from pathlib import Path
sys.path.append(os.path.abspath("."))
from jarvis_tool.tools_fxn import search_local_files

print("Testing search_local_files('admit card'):")
result = search_local_files("admit card")
print("RESULT:")
print(result)
