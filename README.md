# DragonFuel 🐉

Kostenlose, eigenständige Fitness- und Ernährungs-App mit eigenem Design.

## Aktueller Stand
- 1.000+ Lebensmittel-Einträge als Entwicklungsdatenbank
- Suche, Kategorien, Favoriten und Gramm-basierte Berechnung
- Mahlzeiten speichern und Tagesübersicht
- Wassertracking
- Trainingspläne mit Timer
- Statistikansicht
- mobile-first PWA-Struktur
- Foto-Tracking-Oberfläche mit optionalem KI-Backend

## Lokal starten

```bash
npm install
npm run dev
```

Für einen Produktionsbuild:

```bash
npm run build
```

## Deployment über GitHub

Das Projekt ist für ein Git-basiertes Vite-Deployment vorbereitet. Der einfachste Weg ist, dieses Repository bei einem Hosting-Anbieter mit GitHub-Import zu verbinden.

Build-Befehl: `npm run build`
Output: `dist`
Framework: Vite

Die Datei `api/analyze-food.ts` ist als serverseitige Funktion vorbereitet. Für echtes KI-Foto-Tracking muss im Deployment sicher ein `OPENAI_API_KEY` als Secret gesetzt werden. Der Schlüssel darf nicht in GitHub committed werden.

## Hinweis zur Lebensmitteldatenbank

Die Referenzdaten sind für die App-Entwicklung gedacht. Ein Teil der 1.000+ Einträge sind Näherungs-/Entwicklungswerte und sollten vor einer Veröffentlichung als medizinisch oder ernährungswissenschaftlich genaue Daten nicht ungeprüft verwendet werden.

## Sicherheit und Datenschutz

Mahlzeiten, Favoriten, Wasser und Trainingsstatus werden aktuell lokal im Browser gespeichert. Es ist kein Benutzerkonto erforderlich.
