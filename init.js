import { Projekt, Datenquelle, Datensatz, ObjectManager } from './models.js';

function buildDatenquelleFromJson(json) {
    return new Datenquelle(
        json.id,
        json.title,
        json.short_description,
        json.long_description,
        json.update_date,
        json.description_url,
        json.api_url,
        json.license,
        json.status_code
    );
}

function buildProjektFromJson(json) {
    const projekt = new Projekt(
        json.id,
        json.title,
        json.short_description,
        json.long_description,
        json.logo_url,
        json.start_date,
        json.end_date,
        {
            manager_name: json.manager_name,
            manager_email: json.manager_email
        }
    );
    return projekt;
}

export function initializeData(projectData, datenquellenData) {
    const projektManager = new ObjectManager(Projekt);
    const datenquellenManager = new ObjectManager(Datenquelle);

    datenquellenData.forEach(pJson => {
        const dataSource = buildDatenquelleFromJson(pJson);
        datenquellenManager.add(dataSource);
    });

    projectData.forEach(pJson => {
        const projekt = buildProjektFromJson(pJson);
        projektManager.add(projekt);
    });

    window.projektManager = projektManager;
    window.datenquellenManager = datenquellenManager;


    testModels();
}


function testModels() {
  console.log("== Starte Tests der Modelle ==");

  const projekt = new Projekt(
    1,
    "Testprojekt",
    "Kurze Beschreibung",
    "Lange Beschreibung dieses Projekts.",
    "https://example.com/logo.png",
    "2025-01-01",
    "2025-12-31",
    { manager_name: "Max Mustermann", manager_email: "max@example.com" }
  );

  const projekt2 = new Projekt(
    1,
    "Projekt",
    "Kurze Beschreibung",
    "Lange Beschreibung dieses Projekts.",
    "https://example.com/logo.png",
    "2025-01-01",
    "2025-10-31",
    { manager_name: "Max Mustermann", manager_email: "max@example.com" }
  );

  const datenquelle = new Datenquelle(
    101,
    "Testdatenquelle",
    "Kurze Datenquellenbeschreibung",
    "Ausführliche Datenquellenbeschreibung",
    "2025-05-01",
    "https://example.com/info",
    "https://api.example.com",
    "MIT",
    200
  );

  projekt.addDatenquelle(datenquelle);

  console.log("Projekt und Datenquelle erfolgreich verknüpft:");
  console.log(`  → Projekt kennt ${projekt.datenquellen.length} Datenquelle(n)`);
  console.log(`  → Datenquelle kennt ${datenquelle.projekte.length} Projekt(e)`);

  const datensatz = new Datensatz("ds1", 48.137, 11.575);
  datensatz.setAttribute("Temperatur", "20°C");
  datensatz.setAttribute("Luftfeuchtigkeit", "60%");

  datenquelle.addDatensatz(datensatz);
  console.log("Datensatz erfolgreich zur Datenquelle hinzugefügt:");
  console.log(`  → Attribute: ${JSON.stringify(datensatz.attributes)}`);

  const projektManager = new ObjectManager(Projekt);
  const datenquellenManager = new ObjectManager(Datenquelle);

  projektManager.add(projekt);
  projektManager.add(projekt2);
  datenquellenManager.add(datenquelle);

  console.log("Projekt und Datenquelle im ObjectManager gespeichert.");

  const restlaufzeit = projekt.getRestlaufzeit();
  console.log(`Restlaufzeit des Projekts: ${restlaufzeit} Tag(e)`);

  let searchTxt="kt";
  const suchergebnisse = projektManager.suche("title", searchTxt);
  console.log(`Gefundene Projekte mit Titel '${searchTxt}': ${suchergebnisse.length}`);

  projektManager.sortiereNach("title");
  console.log("Projekte nach Titel sortiert (aufsteigend):");
  projektManager.getAll().forEach((p) => console.log(`  - ${p.title}`));

  projektManager.sortiereNach("restlaufzeit", true);
  console.log("Projekte nach Restlaufzeit sortiert (absteigend):");
  projektManager.getAll().forEach((p) =>
    console.log(`  - ${p.title}: ${p.getRestlaufzeit()} Tag(e)`)
  );

  console.log("== fertig ==");
}
