from pathlib import Path
from PIL import Image,ImageDraw
import sys, subprocess
names=sys.argv[1:]
root=Path(__file__).resolve().parents[2]
out=Image.new('RGB',(315*len(names),730),'#e7e5ec');d=ImageDraw.Draw(out)
for i,name in enumerate(names):
 subprocess.run([sys.executable,str(root/'qa/native/crop.py'),name],check=True)
 im=Image.open(root/'output/qa/android'/f'{name}.png');im.thumbnail((310,690));out.paste(im,(315*i,30));d.text((315*i+4,5),name,fill='black')
out.save('/tmp/android-qa-contact.png')
