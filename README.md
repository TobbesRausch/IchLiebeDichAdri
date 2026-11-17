# Für Adri

Eine statische kleine Web-App für GitHub Pages.

## Inhalte anpassen

- Gründe stehen in [`texte.json`](texte.json). Füge dort weitere Texte als JSON-Strings hinzu.
- Bilder gehören in [`Fotos`](Fotos). Ergänze ihre Dateinamen in [`Fotos/fotos.json`](Fotos/fotos.json). Der Besito-Knopf wechselt bei jedem Klick zum nächsten Bild.
- Der Kuss-Sound wird direkt im Browser erzeugt; dafür ist keine zusätzliche Audiodatei nötig.

## Auf GitHub Pages veröffentlichen

Lade den Inhalt dieses Repositorys auf GitHub hoch. Öffne dann **Settings → Pages**, wähle als Quelle den Branch `main` und den Ordner `/ (root)`, und speichere. GitHub zeigt anschließend die URL der Website an.

Die Anwendung verwendet `fetch()` zum Laden der JSON-Dateien. Öffne sie daher über GitHub Pages oder einen lokalen Webserver, nicht direkt als `file://`-Datei.
