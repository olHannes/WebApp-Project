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
}
