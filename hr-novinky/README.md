# HR novinky 4BROS

Artefakt: https://claude.ai/artifact/7YiFG7ekQjkVwkSjCScxKf

- `index.html` – stránka (Přehled, Co se blíží, HR kalendář, hledání a archiv po dnech).
- `data/` – úvodní data, která jsou nahraná v databázi artefaktu (kolekce `news`, `events`, dokument `meta/info`).
  `seed.py` z nich generuje JSON soubory.

Zprávy se nepíší do HTML, ale do databáze artefaktu, takže se dají doplňovat bez nového vydání stránky.
Zapisovat smí jen vlastník a editoři.

Pole zprávy: `date`, `category`, `kind` (hlavni/trend/zmena), `region` (ČR/EU/Svět), `status`,
`effectiveDate`, `title`, `summary`, `action`, `tags`, `sources` [{name, url}].
