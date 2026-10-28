"""Assemble owner-supplied reference boards beside actual-component fixture captures."""
from pathlib import Path
from html import escape
from PIL import Image,ImageDraw
root=Path(__file__).resolve().parents[2]
out=root/'output/qa/fidelity'
groups=[
 ('03-welcome-auth',['welcome','signin','signup']),
 ('04-verify-recover',['verify','recovery','reset-code','new-password','continue']),
 ('05-onboarding-discovery',['username','onboarding','discover']),
 ('06-communities',['preview','community','community-about','create','created']),
 ('07-compose',['source','crop','compose']),
 ('08-publish-edit',['publishing','edit-post','retry','post']),
 ('09-feed-interaction',['home','post','activity']),
 ('10-profiles',['profile','public-profile','edit-profile']),
 ('11-report-block',['report','report-reason','report-sent','blocked']),
 ('12-moderation',['creator','reports','report-review']),
 ('13-account-dark',['settings','home-dark','settings-dark','profile-dark','recovery-dark']),
 ('14-important-states',['empty-home','empty-activity','empty-profile','loading','unavailable','retry']),
]
parts=['''<!doctype html><meta charset="utf-8"><title>Codexgram — source and implementation</title>
<style>body{font:16px system-ui;background:#eeedf1;color:#24212b;margin:0;padding:32px}h1{max-width:900px}p{max-width:1000px;line-height:1.6}section{background:white;padding:24px;margin:32px 0;border-radius:20px}img.reference{width:100%;max-width:1500px;display:block}div.screens{display:flex;gap:20px;overflow:auto;padding:20px 0}figure{margin:0;flex:0 0 280px}figure img{width:280px;border:1px solid #dedbe5;border-radius:12px}figcaption{padding:8px;font-size:14px}a{color:#5832cd}small{display:block;margin:8px 0}</style>
<h1>Codexgram: supplied boards and corrected app screens</h1>
<p>The large image in each section is the original reference. The smaller images render the actual app components in an isolated React Native Web fixture harness at 393×852. Local sample photos populate layouts without writing to Convex. Authentication, native pickers, system alerts, navigation bars, and tabs in this harness are substituted; these captures prove component layout, not native or live-service acceptance. Native iOS evidence appears at the end.</p>
<p>Boards 01 and 02 define the design system and journey, rather than individual app screens. Original option B applies: no coffee hero on sign-in. Screen dimensions, real account data, OS controls, accessibility sizing, and supported beta capabilities affect the final presentation.</p>''']
for board,names in groups:
 parts.append(f'<section><h2>{escape(board)}</h2><img class="reference" src="../../design/codexgram-beta/{board}.png"><h3>Actual component captures · local fixtures</h3><div class="screens">')
 for name in names:
  file=f'{name}-fixture.png'
  if (out/file).exists():parts.append(f'<figure><a href="{file}"><img src="{file}"></a><figcaption>{escape(name)}</figcaption></figure>')
 parts.append('</div></section>')
parts.append('<section><h2>Native iOS simulator captures</h2><small>Real signed-in account; no fixture data. Device Hub and development controls are visible.</small><div class="screens">')
for p in sorted((out/'native-ios').glob('*.png')):parts.append(f'<figure><img src="native-ios/{p.name}"><figcaption>{p.stem}</figcaption></figure>')
parts.append('</div></section>')
(out/'comparison.html').write_text('\n'.join(parts))
selected=['welcome','signin','verify','recovery','username','discover','community','created','compose','crop','home','post','profile','edit-profile','activity','report-reason','report-sent','reports','settings','recovery-dark']
contact=Image.new('RGB',(1150,((len(selected)+4)//5)*525),'#E8E6EB');draw=ImageDraw.Draw(contact)
for i,name in enumerate(selected):
 p=out/f'{name}-fixture.png'
 if not p.exists():continue
 im=Image.open(p);im.thumbnail((225,488));x=(i%5)*230;y=(i//5)*525;contact.paste(im,(x,y+24));draw.text((x+5,y+5),name,fill='black')
contact.save(out/'contact-sheet.png')
print(out/'comparison.html')
