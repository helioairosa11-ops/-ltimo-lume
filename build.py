"""Junta src/head.html + src/js/*.js num só HTML.
Saídas:
  dist/index.html      -> documento completo (bibliotecas locais em lib/) — para GitHub Pages e testes
  dist/artifact.html   -> fragmento para publicação (bibliotecas do jsDelivr)
Uso: python3 build.py [--test arquivo.js] [--only 00,01,...]
"""
import pathlib, sys, json, shutil, re
root = pathlib.Path(__file__).parent
args = sys.argv[1:]
test = None; only = None
if '--test' in args: test = args[args.index('--test') + 1]
if '--only' in args: only = args[args.index('--only') + 1].split(',')
head = (root / 'src/head.html').read_text(encoding='utf-8') if (root / 'src/head.html').exists() else '<title>Último Lume</title><canvas id="cv"></canvas>'
files = sorted((root / 'src/js').glob('*.js'))
if only: files = [f for f in files if f.name[:2] in only]
js = '\n'.join(f.read_text(encoding='utf-8') for f in files)
if test: js += '\n' + pathlib.Path(test).read_text(encoding='utf-8')
sfx = sorted(p.stem for p in (root / 'audio/s').glob('*.mp3'))
js = js.replace('/*SFX_LIST*/[]', json.dumps(sfx))
def importmap(base, addons):
    return '<script type="importmap">' + json.dumps({"imports": {"three": base, "three/addons/": addons}}) + '</script>'
local = importmap('./lib/three.module.min.js', './lib/addons/')
cdn = importmap('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js', 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/')
title_end = head.find('</title>') + len('</title>')
dist = root / 'dist'; dist.mkdir(exist_ok=True)
body_split = head.split('<!--BODY-->')
head_part = body_split[0]; body_part = body_split[1] if len(body_split) > 1 else ''
script = '<script type="module">\n' + js + '\n</script>'
full = f'''<!doctype html>
<html lang="pt">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no">
<meta name="theme-color" content="#060507">
<meta name="description" content="Último Lume: um souls-like em 3D que roda no navegador.">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Último Lume">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" href="icons/icon-192.png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
{head_part.strip()}
{local}
</head>
<body>
{body_part.strip()}
{script}
<script>
if ('serviceWorker' in navigator && location.protocol === 'https:') {{ addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {{}})); }}
</script>
</body>
</html>
'''
(dist / 'index.html').write_text(full, encoding='utf-8')
art = head_part.strip() + '\n' + cdn + '\n' + body_part.strip() + '\n' + script
(dist / 'artifact.html').write_text(art, encoding='utf-8')
for d in ['lib', 'audio']:
    if not (dist / d).exists(): shutil.copytree(root / d, dist / d)
print('ok', len(js) // 1024, 'KB js,', len(files), 'arquivos')
