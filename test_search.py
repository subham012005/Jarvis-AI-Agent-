import os
import sys
from pathlib import Path
sys.path.append(os.path.abspath("."))
from jarvis_tool.tools_fxn import search_local_files

print("Testing search_local_files('subham resume'):")
result = search_local_files("subham resume")
print("RESULT:")
print(result)
