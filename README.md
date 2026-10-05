# DragonFuel 🐉

DragonFuel ist eine eigenständige Fitness- und Ernährungs-App mit eigenem Design.

## App-Funktionen
- 1.000+ Lebensmittel-Einträge als Entwicklungsdatenbank
- Suche, Kategorien, Favoriten und Gramm-basierte Berechnung
- Mahlzeiten speichern und Tagesübersicht
- Wassertracking
- Trainingspläne mit Timer
- Statistikansicht
- mobile-first React/Vite-Oberfläche
- Foto-Tracking-Oberfläche mit optionalem KI-Backend
- **Android-App-Build über Capacitor + GitHub Actions**

## Android-App

Das Projekt kann über Capacitor als echte Android-App gebaut werden.

```bash
npm install
npm run build
npx cap add android
npx cap sync android
cd android
./gradlew assembleDebug
```

Die fertige Debug-APK liegt anschließend unter:
`android/app/build/outputs/apk/debug/app-debug.apk`

Alternativ startet der Workflow `.github/workflows/android.yml` den APK-Build automatisch bei einem Push auf den DragonFuel-Branch. Die APK wird als GitHub Actions Artifact bereitgestellt.

## Foto-Tracking

`api/analyze-food.ts` ist als serverseitige Funktion vorbereitet. Für echtes KI-Foto-Tracking muss im Deployment sicher ein `OPENAI_API_KEY` als Secret gesetzt werden. Der Schlüssel darf niemals in GitHub committed werden.

## Lebensmitteldatenbank

Die Referenzdaten sind für die App-Entwicklung gedacht. Ein Teil der 1.000+ Einträge sind Näherungs-/Entwicklungswerte und sollten vor einer Veröffentlichung nicht ungeprüft als exakte Ernährungsdaten verwendet werden.

## Datenschutz

Mahlzeiten, Favoriten, Wasser und Trainingsstatus werden aktuell lokal im Browser bzw. in der App gespeichert. Es ist kein Benutzerkonto erforderlich.
