"""Turn the Vite build into one page fragment: title, fonts, inline CSS and the inline app script."""
import re, sys, pathlib
src = pathlib.Path(sys.argv[1]); out = pathlib.Path(sys.argv[2])
html = src.read_text()
base = src.parent
js_path = re.search(r'<script type="module" crossorigin src="\./([^"]+)"', html).group(1)
css_m = re.search(r'<link rel="stylesheet" crossorigin href="\./([^"]+)"', html)
js = (base / js_path).read_text().replace('</script', '<\\/script')
css = (base / css_m.group(1)).read_text() if css_m else ''
fonts = 'https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&family=Fredoka:wght@500;600;700&family=STIX+Two+Text:ital,wght@0,400;0,600;1,400;1,600&display=swap'
page = f'''<title>Numbat Maths</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="{fonts}">
<style>{css}</style>
<div id="root"></div>
<script type="module">{js}</script>
'''
out.write_text(page)
print(out, len(page.encode()) // 1024, 'KB')
