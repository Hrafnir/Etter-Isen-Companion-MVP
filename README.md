# Etter Isen Companion MVP

Dette er en statisk companion-app for **Etter Isen**. Den kan legges rett på GitHub og kjøres med GitHub Pages.

## Innhold

- Jegerbygger med stats, skills, pust og portrettfil
- Printbart karakterark, med mulighet til å velge «Lagre som PDF» i utskriftsdialogen
- Registrering av jaktresultat
- Automatisk ressurslager
- Ressursfordeling i stammefasen
- Milepæler og avsjekk
- Hendelsesmotor med små fortellinger
- Fortellingslogg
- Import/eksport av kampanjedata som JSON

## Filstruktur

```text
etter-isen-companion/
├── index.html
├── style.css
├── app.js
├── README.md
├── data/
│   ├── archetypes.json
│   ├── events.json
│   ├── resources.json
│   └── scenarios.json
└── assets/
    ├── img/
    │   ├── cover-placeholder.svg
    │   └── README.md
    └── portraits/
        ├── portrait-placeholder.svg
        └── README.md
```

## Bilder du kan legge til senere

Forsidebilde:

- `assets/img/cover.jpg`

Portretter:

- `assets/portraits/jeger_01.png`
- `assets/portraits/jeger_02.png`
- `assets/portraits/jeger_03.png`
- `assets/portraits/jeger_04.png`

Du kan også bruke egne filnavn. Skriv da riktig filbane i feltet «Portrettfil» når du lager jeger.

## Slik legger du dette på GitHub

1. Lag et nytt repository på GitHub, for eksempel `etter-isen-companion`.
2. Last opp alle filene og mappene i denne ZIP-en.
3. Gå til **Settings → Pages**.
4. Velg **Deploy from a branch**.
5. Velg branch `main` og folder `/root`.
6. Trykk **Save**.
7. Etter litt tid får du en GitHub Pages-lenke.

## Lokal testing

Appen er laget for GitHub Pages. Hvis du bare åpner `index.html` direkte fra filsystemet, kan enkelte nettlesere blokkere lasting av JSON-filene. Bruk gjerne en enkel lokal server:

```bash
python3 -m http.server 8000
```

Åpne deretter:

```text
http://localhost:8000
```

## PDF / karakterark

Når du trykker **Karakterark / PDF**, åpnes utskrift. Velg **Lagre som PDF** i nettleseren. Dette er valgt bevisst for MVP-en, slik at appen ikke trenger eksterne biblioteker.

## Lagring

Appen bruker `localStorage`. Det betyr at data lagres i nettleseren på maskinen som brukes. Bruk **Data → Last ned kampanjedata** for backup.


## Introvideo

Introvideo ligger i `assets/video/intro.mp4`.
Se `assets/video/README.md` for enkel HTML/CSS-snutt.


## Introvideo i appen

Videoen ligger her:

```text
assets/video/intro.mp4
```

Appen viser introen første gang den åpnes på en enhet/nettleser. Når brukeren trykker **Hopp over**, **Gå til appen**, eller videoen spilles ferdig, lagres dette i nettleserens `localStorage` med nøkkelen `etterIsenIntroSeen.v1`. Da vises ikke introen automatisk neste gang.

På forsiden finnes knappen **Spill intro**, slik at videoen kan spilles av på nytt uten å nullstille kampanjen.

For å vise introen automatisk igjen kan du enten bruke appens **Nullstill alt**, eller slette `etterIsenIntroSeen.v1` fra nettleserens localStorage.
