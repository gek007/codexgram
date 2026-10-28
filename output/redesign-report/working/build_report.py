from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from hashlib import sha256
from lxml import etree as E
from PIL import Image, ImageOps
import json, io

root=Path('/Users/administrator/Developer/my/codexgram')
work=root/'output/redesign-report/working'
ref=Path('/Users/administrator/.codex/plugins/cache/openai-curated-remote/openai-templates/0.1.1/skills/artifact-template-design-report/assets/reference.docx')
out=root/'output/redesign-report/Codexgram-Design-Report.docx'
n={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
w='{'+n['w']+'}'
with ZipFile(ref) as z:
 parts={p:z.read(p) for p in z.namelist()}
r=E.fromstring(parts['word/document.xml']); ps=r.findall('.//w:p',n)
replacements={
2:'Codexgram redesign',3:'Visual design for the original fourteen screen boards',5:'Prepared for Codexgram',6:'October 2026',
23:'Bring the existing Codexgram beta closer to the original fourteen design boards across iOS and Android. The selected direction keeps sign-in free of the newer coffee hero and applies the supplied violet and ivory visual system to every existing journey.',
24:'The app already has the palette, core routes and connected data flows. The redesign should improve visual fidelity through consistent typography, spacing, image treatment, navigation and action hierarchy while protecting the working authentication, publishing and moderation behavior.',
26:'Selected direction B covers the original boards 01 to 14. The newer standalone authentication and coffee variants are excluded.',
27:'Prioritize shared controls, original authentication, discovery and community layouts, then publishing, engagement, profiles and account screens.',
28:'Accept changes through reference comparisons and native checks. Preserve real account data, accessible controls, safe drafts and upload retries.',
30:'Codexgram is a public photo community beta with email, Google and Facebook authentication. Members join communities, publish one photo at a time, and interact through likes, comments and in-app activity. Creators and app admins have distinct moderation powers.',
31:'This report translates the selected images into a visual contract for existing screens. The detailed implementation scope is recorded in the companion repository design document dated 28 October 2026.',
33:'The first design integration established the basic identity, but several interfaces still use generic button stacks and repeated headings. The supplied boards give stronger guidance for compact metadata, icon rows, imagery, grouped settings and distinct action types.',
35:'The iOS audit verified library selection, publishing, drafts, post and comment editing, profiles and Google sign-in. It also found duplicate titles, an unclear composer exit and crop guides that lose contrast on a white image. These are included in this pass.',
37:'The palette already closely matches board 01. More of the remaining difference comes from composition: generous but deliberate spacing, a stronger type hierarchy, photo-first cards, compact action rows and clear primary versus secondary controls.',
39:('Design priority. ','Improve composition and clarity while retaining the tested data and permission boundaries.'),
42:'A shared component pass will improve many screens together. Screen-specific work is still needed for welcome imagery, community identity, composer stages, profile layout and grouped settings.',
46:'Hierarchy',47:'Repeated titles and button stacks',48:'Use one title and distinct action styles',
49:'Media',50:'Photo-first reference layouts',51:'Preserve photo scale and compact metadata',
52:'Reliability',53:'Picker race fixed in prior audit',54:'Retain dismissal ordering and draft safety',
56:'Implement the selected boards in controlled groups. Compare each group at a consistent phone viewport and keep platform-specific navigation and accessibility behavior functional.',
57:('Unify the foundation. ','Apply board 01 type, spacing, field, button and sheet roles. Add provider icons, focus and error treatment, compact action rows and clear loading states.'),
58:('Refine the journeys. ','Match original welcome and auth first, then onboarding and communities, composer and feed, profiles, safety and settings. Recreate interactive controls natively; keep real content and roles.'),
59:('Verify the result. ','Run lint, typecheck and regression tests. Compare light and dark screens, short heights, keyboard states and larger text. Record unavailable device or role checks honestly.'),
61:'The selected approach is a visual refinement of the connected app. It does not require a new backend, UI framework, seeded sample accounts or changes to publishing limits and moderation authority.',
62:'Review the companion design contract before implementation. Success means closer reference fidelity with reachable actions, readable text, working navigation and unchanged data integrity.',
65:'The original boards remain the visual authority. Do not copy phone frames, status-bar artwork, sample identities or fake engagement into production screens. Welcome decoration may reuse clean supplied imagery; user feeds continue to show actual data.',
66:'Intentional adaptations retain device-controlled appearance, native camera and library interfaces, accessible code entry and sequential SDK reset steps. Do not add legal URLs, member directories or resolved-report browsing merely because a mockup depicts them.',
67:'Sources',
68:'Supplied design set. Boards 01 to 04 cover components, journeys, welcome, authentication and recovery.',
69:'Supplied design set. Boards 05 to 10 cover onboarding, communities, publishing, feeds, comments and profiles.',
70:'Supplied design set. Boards 11 to 14 cover reporting, moderation, settings, dark appearance and important states.',
71:'Repository evidence. Design notes, current UI components and iOS simulator audit dated 28 October 2026.',
73:('Acceptance boundary. ','Facebook completion, second-user and admin flows, physical camera and larger text remain separate native acceptance checks.'),
}
def texts(p):return p.findall('.//w:t',n)
for i,value in replacements.items():
 ts=texts(ps[i]); assert ts, i
 if isinstance(value,tuple):
  assert len(ts)>=2,i
  ts[0].text=value[0];ts[1].text=value[1]
  for t in ts[2:]:t.text=''
 else:
  ts[0].text=value
  for t in ts[1:]:t.text=''
# Preserve TOC structure and fields; correct the source's off-page leader stop.
for i in range(10,22):
 for tab in ps[i].findall('.//w:tabs/w:tab',n):tab.set(w+'pos','9360')
# Keep cached contents labels aligned with headings and existing page numbering.
for t in texts(ps[21]):
 if t.text=='Source placeholders':t.text='Sources'
parts['word/document.xml']=E.tostring(r,xml_declaration=True,encoding='UTF-8',standalone=True)
h=E.fromstring(parts['word/header1.xml'])
for t in h.findall('.//w:t',n):
 if t.text=='Report title':t.text='Codexgram redesign'
 if t.text=='Date':t.text='28 October 2026'
parts['word/header1.xml']=E.tostring(h,xml_declaration=True,encoding='UTF-8',standalone=True)
s=E.fromstring(parts['word/settings.xml']); u=s.find('w:updateFields',n)
if u is None:u=E.SubElement(s,w+'updateFields')
u.set(w+'val','true')
parts['word/settings.xml']=E.tostring(s,xml_declaration=True,encoding='UTF-8',standalone=True)
# Replace only the cover's image slot with a fitted view of the chosen references.
orig=Image.open(io.BytesIO(parts['word/media/image1.png']))
canvas=Image.new('RGB',orig.size,'#FAF9F6'); width,height=canvas.size
for j,name in enumerate(['03-welcome-auth.png','09-feed-interaction.png']):
 im=Image.open(root/'output/design/codexgram-beta'/name).convert('RGB')
 fitted=ImageOps.contain(im,(width-24,height//2-24))
 x=(width-fitted.width)//2;y=j*(height//2)+(height//2-fitted.height)//2
 canvas.paste(fitted,(x,y))
b=io.BytesIO();canvas.save(b,format='PNG');parts['word/media/image1.png']=b.getvalue()
with ZipFile(out,'w',ZIP_DEFLATED) as z:
 for k,v in parts.items():z.writestr(k,v)
with ZipFile(ref) as z:
 changed=[k for k,v in parts.items() if v!=z.read(k)]
 allowed=['word/document.xml','word/header1.xml','word/settings.xml','word/media/image1.png']
 assert sorted(changed)==sorted(allowed),changed
print(out)
print('Changed package parts:',changed)
