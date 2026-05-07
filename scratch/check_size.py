from PIL import Image
import os

img_path = r'c:\AI\projects\P0007_MadeInMaghribalt3\public\characters\hakima\standing_proc\normal.webp'
if os.path.exists(img_path):
    img = Image.open(img_path)
    print(f"Size: {img.size}")
else:
    print("File not found")
