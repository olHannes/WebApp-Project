import { Projekt, Datenquelle, Datensatz, ObjectManager } from './models.js';

function buildDatenquelleFromJson(json) {
    return new Datenquelle(
        json.id,
        json.title,
        json.short_description,
        json.long_descriptions,
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
        json.long_descriptions,
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

    const alleProjekte = projektManager.getAll();
    const alleDatenquellen = datenquellenManager.getAll();

    alleProjekte.forEach(projekt => {
        const maxQuellen = 4;
        const anzahl = Math.floor(Math.random() * Math.min(maxQuellen, alleDatenquellen.length)) + 1;
        const ausgewaehlt = shuffleArray(alleDatenquellen).slice(0, anzahl);

        ausgewaehlt.forEach(dq => {
            projekt.addDatenquelle(dq);
        });
    });


    console.log("Projektmanager\n", projektManager);
    console.log("Datenquellenmanager\n", datenquellenManager);
    window.projektManager = projektManager;
    window.datenquellenManager = datenquellenManager;
}

function shuffleArray(array) {
    const arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}


export function addRandDatasources(exampleData) {
    let data = [];
    exampleData.forEach(element => {
        let tempData = new Datensatz(element.id, element.pos_lat, element.pos_lon);

        for (const key in element) {
            tempData.setAttribute(key, element[key]);
        }
        data.push(tempData);
    });

    const datasources = window.datenquellenManager.getAll();
    const total = data.length;

    datasources.forEach(datasource => {
        const numToAdd = Math.floor(Math.random() * 15) + 1;

        const usedIndices = new Set();
        while (usedIndices.size < numToAdd && usedIndices.size < total) {
            const randIndex = Math.floor(Math.random() * total);
            usedIndices.add(randIndex);
        }

        [...usedIndices]
            .sort((a, b) => a - b)
            .forEach(index => {
                const ds = data[index];
                datasource.addDatensatz(ds);
            });
    });
}
