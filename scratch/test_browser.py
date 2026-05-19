import sys
import os
sys.path.append(os.path.abspath(os.path.dirname(__file__) + "/.."))

from jarvis_tool.tools_fxn import browser_control

# Test opening a page and scrolling
print(browser_control("open $ https://www.google.com"))
print(browser_control("scroll $ down"))
print("Done")
