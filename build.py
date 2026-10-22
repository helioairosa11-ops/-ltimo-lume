"""Junta src/head.html + src/js/*.js num só ficheiro index.html (o jogo inteiro).
Uso: python3 build.py
"""
import pathlib, sys, json, shutil
root = pathlib.Path(__file__).parent
head = (root / 'src/head.html').read_text(encoding='utf-8')
files = sorted((root / 'src/js').glob('*.js'))
js = '\n'.join(f.read_text(encoding='utf-8') for f in files)
sfx = sorted(p.stem for p in (root / 'audio/s').glob('*.mp3'))
js = js.replace('/*SFX_LIST*/[]', json.dumps(sfx))
head_part, body_part = head.split('<!--BODY-->')
script = '<script type="module">\n' + js + '\n</script>'
full = f'''<!doctype html>
<html lang="pt">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no">
<meta name="theme-color" content="#050407">
<meta name="description" content="Último Lume: um metroidvania sombrio com alma de souls-like, que corre no navegador.">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Último Lume">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" href="icons/icon-192.png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
{head_part.strip()}
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
(root / 'index.html').write_text(full, encoding='utf-8')
print('ok', len(js) // 1024, 'KB js,', len(files), 'arquivos')
