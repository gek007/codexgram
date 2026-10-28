from PIL import Image
from pathlib import Path
import sys
name=sys.argv[1]
assert all(c.isalnum() or c in '-_' for c in name)
root=Path(__file__).resolve().parents[2]
out=root/'output/qa/android'/f'{name}.png'
im = Image.open(Path('/tmp')/f'native-qa-{name}.png' if (Path('/tmp')/f'native-qa-{name}.png').exists() else '/tmp/codexgram-android-current.png')
bounds = {2800: (1830,270,2459,1668), 3022: (2042,269,2622,1557), 3840: (2764,278,3537,1997)}
if im.width not in bounds:
    raise ValueError(f'Inspect screenshot and add its emulator bounds: {im.size}')
im.crop(bounds[im.width]).save(out)
