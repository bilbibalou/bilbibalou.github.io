import os, json

ICON_DIR = "icons"
EXT = (".svg", ".png", ".jpg", ".jpeg")
icons = []

for root, _, files in os.walk(ICON_DIR):
    for f in sorted(files):
        if f.lower().endswith(EXT):
            path = os.path.join(root, f).replace("\\", "/")
            name = os.path.splitext(f)[0].replace("_", " ").replace("-", " ")
            folders = os.path.relpath(root, ICON_DIR).replace("\\", "/").split("/")
            tags = " ".join(x for x in folders if x != ".") + " " + name
            icons.append({"name": name.capitalize(), "tags": tags.lower(), "src": path})

with open("bioimg-icons.js", "w", encoding="utf-8") as out:
    out.write("// Fichier généré automatiquement par generate_icons.py\n")
    out.write("window.BIOIMG_ICONS = ")
    out.write(json.dumps(icons, ensure_ascii=False, indent=2))
    out.write(";\n")

print(f"{len(icons)} icônes ajoutées.")