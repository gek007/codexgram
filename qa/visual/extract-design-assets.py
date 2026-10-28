"""Copy isolated decorative regions from the owner-supplied boards. Originals stay unchanged."""
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parents[2]
src=root/'output/design/codexgram-beta'; out=root/'assets/design'
def crop(name,board,box,transparent=False):
 im=Image.open(src/board).convert('RGBA').crop(box)
 if transparent:
  # Remove the source's white matte continuously; a hard threshold produces
  # visible white speckles on the app's dark appearance.
  px=im.load()
  for y in range(im.height):
   for x in range(im.width):
    r,g,b,_=px[x,y]
    alpha=max(0,min(255,(245-min(r,g,b))*6))
    if not alpha: px[x,y]=(0,0,0,0); continue
    px[x,y]=tuple(max(0,min(255,round((c-255+alpha)*255/alpha))) for c in (r,g,b))+(alpha,)

 im.save(out/f'{name}.png')
for name,box in [('community-violet',(804,285,954,430)),('community-green',(966,285,1115,430)),('community-orange',(804,530,954,670)),('community-night',(966,530,1115,670))]:crop(name,'05-onboarding-discovery.png',box)
crop('community-violet-cover','06-communities.png',(802,800,1080,878))
for name,box in [('mail',(87,293,280,425)),('lock',(479,288,672,426)),('key',(884,279,1080,401)),('providers',(1244,291,1459,417))]:crop(name,'04-verify-recover.png',box,True)
crop('community-success','06-communities.png',(1218,169,1469,407),True)
crop('report-success','11-report-block.png',(880,306,1068,396),True)
crop('feed-empty','14-important-states.png',(77,195,291,341),True)
crop('conversation-empty','08-publish-edit.png',(591,615,679,668),True)
# Populated visual test fixtures only; never imported by a product screen or seeded into Convex.
fixtures=root/'qa/visual/fixtures';fixtures.mkdir(exist_ok=True)
for name,board,box in [('coffee','09-feed-interaction.png',(42,255,368,506)),('plant','09-feed-interaction.png',(44,673,368,798)),('avatar','10-profiles.png',(58,246,170,350))]:
 Image.open(src/board).crop(box).save(fixtures/f'{name}.png')
