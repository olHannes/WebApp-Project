import { initMap, showUserLocation, addDataPoint } from "./mapModule.js";
import { initChart, addDatasetToChart } from "./chartModule.js";
import { Datenquelle, Datensatz, ObjectManager } from "../models.js";
import { initializeData, addRandDatasources, loadExternData, buildDatenquelleFromJson } from "../init.js";



function showDatasource(DS) {

    if (!DS) {  
        console.warn("Keine Datenquelle gefunden.");
        document.getElementById('map').style.display="none";
        return;
    }

    const dTitle = DS.title || "Kein Titel";
    const dShortDesc = DS.shortDescription || "Keine Kurzbeschreibung verfügbar";

    let formattedDate = "Unbekannt";
    try {
        const dUpdate = new Date(DS.updateDate);
        if (!isNaN(dUpdate)) {
            formattedDate = dUpdate.toLocaleDateString("de-DE", {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        }else {
            formattedDate = "--.--.----";
        }
    } catch (e) {
        console.warn("Ungültiges Datum:", DS.updateDate);
    }

    const dApi = DS.data_description_url || null;
    const dLicense = DS.license || "Nicht verfügbar";

    document.getElementById('DsTitle').innerText = dTitle;
    document.getElementById('DsShortDescription').innerText = dShortDesc;
    document.getElementById('DsDate').innerText = formattedDate;
    
    const elLink = document.getElementById('DsLink');
    if (elLink) {
        if (dApi) {
            elLink.href = dApi;
            elLink.innerText = "Zur Quelle";
            elLink.style.pointerEvents = "auto";
            elLink.style.color = "";
        } else {
            elLink.href = "#";
            elLink.innerText = "Keine Quelle verfügbar";
            elLink.style.pointerEvents = "none";
            elLink.style.color = "gray";
        }
    }
    document.getElementById('DsLicense').innerText = dLicense;

    const datasets = DS.datensaetze;
    if(datasets){
        renderExampleDataMap(datasets);
        renderExampleDataChart(datasets);
        renderExampleDataTable(datasets);
    }    
}

function renderExampleDataMap(datasets){
    let foundData = false;
    initMap();
    showUserLocation();

    datasets.forEach(element => {
        if(element.latitude)
            foundData=true;
        const popupText = `ID: ${element.id}, Temp.: ${element.attributes.temp.toFixed(2)}`;
        addDataPoint(element.latitude, element.longitude, popupText);
    });
    if(!foundData){
        document.getElementById('map').style.display="none";
    }
}

function renderExampleDataChart(datasets){
    if(!datasets || datasets.length === 0){
        console.warn("Keine Beispieldaten vorhanden");
        return;
    }
    initChart("Temperature (°C)");
    addDatasetToChart(datasets);

    const elem = document.querySelector("article footer");
    if(!elem) return;

    const tsString = datasets[datasets.length - 1].attributes.ts;
    const tsDate = new Date(tsString);

    let formattedDate;

    if (!isNaN(tsDate)) {
        formattedDate = tsDate.toLocaleDateString("de-DE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    } else {
        formattedDate = "--.--.----";
    }
    elem.innerText = "Datenstand: " + formattedDate;
}

function renderExampleDataTable(datasets) {
    const tableWrapper = document.querySelector(".tableWrapper");
    if (!tableWrapper) {
        console.error("Kein Element mit der Klasse 'tableWrapper' gefunden.");
        return;
    }

    tableWrapper.innerHTML = "";

    const table = document.createElement("table");

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    ["Datum", "Temperatur", "Feinstaub"].forEach(text => {
        const th = document.createElement("th");
        th.textContent = text;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    const maxRows = 5;
    const rowCount = Math.min(maxRows, datasets.length);

    if(rowCount == 0){
        document.getElementById('tableWrapper').style.display="none";
    }

    for (let i = 0; i < rowCount; i++) {
        const data = datasets[i];
        const attrs = data.attributes;

        const date = new Date(attrs.route).toLocaleDateString("de-DE");
        const temp = `${Math.round(attrs.temp)}°C`;
        const pm2_5 = attrs.pm2_5 !== undefined ? `${Math.round(attrs.pm2_5)}%` : "n/a";

        const row = document.createElement("tr");

        [date, temp, pm2_5].forEach(text => {
            const td = document.createElement("td");
            td.textContent = text;
            row.appendChild(td);
        });
        tbody.appendChild(row);
    }
    table.appendChild(tbody);
    tableWrapper.appendChild(table);
}


function transformDatasourceForStorage(dataSource) {
    return {
        id: dataSource.id || null,
        title: dataSource._title || dataSource.title || "",
        short_description: dataSource._shortDescription || dataSource.shortDescription || "",
        long_description: dataSource._longDescription || dataSource.longDescription || "",
        update_date: new Date(dataSource.updateDate),
        license: dataSource.license || "",
        status_code: dataSource.statusCode || "",
        data_description_url: dataSource.descriptionUrl || dataSource.data_description_url || "",
        data_api_url: dataSource.apiUrl || dataSource.data_api_url || "",
        projekte: Array.isArray(dataSource.projekte) ? dataSource.projekte : [],
        datensaetze: Array.isArray(dataSource.datensaetze) ? dataSource.datensaetze : []
    };
}


async function localSafeDatasource(dataSource) {
    const cleanedData = transformDatasourceForStorage(dataSource);
    localStorage.setItem("dataSource", JSON.stringify(cleanedData));
    console.log("Datenquelle gespeichert:", cleanedData);
}

async function loadLocalDatasource() {
    const stored = localStorage.getItem("dataSource");

    if (!stored) {
        console.warn("Keine lokale Datenquelle gefunden.");
        return null;
    }

    try {
        const parsed = JSON.parse(stored);
        console.log("Lokale Datenquelle geladen:", parsed);

        const rebuildDSManager = new ObjectManager(Datenquelle);
        const rebuildDS = buildDatenquelleFromJson(parsed);
        rebuildDSManager.add(rebuildDS);
        window.datenquellenManager = rebuildDSManager;

        const rawDatensaetze = parsed.datensaetze || [];
        rawDatensaetze.forEach(element => {
            const ds = new Datensatz(element.id, element.attributes.pos_lat, element.attributes.pos_lon);
            for (const key in element.attributes){
                ds.setAttribute(key, element.attributes[key]);
            }
            rebuildDS.addDatensatz(ds);
        });

        return rebuildDS;
    } catch (error) {
        console.error("Fehler beim Parsen der lokalen Datenquelle:", error);
        return null;
    }
}





function getDatasourceIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return parseInt(params.get("id"));
}


function getDatasource(){
    const currentId = getDatasourceIdFromURL();
    if(!currentId) return;

    const datasources = window.datenquellenManager;
    const searchDS = datasources.suche("id", currentId);
    return searchDS;
}


function openForm() {
    document.getElementById("titel").value = document.getElementById("DsTitle").textContent;
    document.getElementById("beschreibungA").value = document.getElementById("DsShortDescription").textContent;
    document.getElementById("quelleA").value = document.getElementById("DsLink").href;
    document.getElementById("quelleA").value = document.getElementById("DsLink").href;
    document.getElementById("lizenz").value = document.getElementById("DsLicense").textContent;
    document.getElementById("nutzung").value = document.getElementById("userManual").textContent;
    

    const dsDateText = document.getElementById("DsDate").textContent.trim();

    const [day, month, year] = dsDateText.split(".");
    if (day && month && year) {
        const htmlDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
        document.getElementById("dateA").value = htmlDate;
    } else {
        console.warn("Datum konnte nicht geparst werden:", dsDateText);
    }

    document.getElementById("dataSource-form").style.display = "block";
}


document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("dataSource-form");
    const submitBtn = document.getElementById("submitBtn");

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = "Speichern...";

        const formData = new FormData(form);
        const rawData = Object.fromEntries(formData.entries());

        const payload = {
            title: rawData.titel,
            short_description: rawData.beschreibungA,
            update_date: new Date(rawData.dateA).toISOString(),
            data_description_url: rawData.quelleA,
            data_api_url: rawData.apiLink || "",
            license: rawData.lizenz,
            long_description: rawData.nutzung,
            status_code: "",
            id: getDatasourceIdFromURL()
        };
    
        try {
            const res = await fetch(`https://scl.fh-bielefeld.de/SmartDataProjects/smartdata/records/datasources/${getDatasourceIdFromURL()}?storage=smartmonitoring`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Serverfehler");

            alert("Daten erfolgreich gespeichert.");
            form.style.display = "none";
            window.location.reload();
        } catch (err) {
            console.error(err);
            alert("Fehler beim Speichern.");
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = "Speichern";
        }
    });
});



var online=false;

document.addEventListener("DOMContentLoaded", async () => {
    //initializeData(window['projects'], window['datasources']);
    //addRandDatasources(window['datasets']);
    
    online = navigator.online;

    if(await loadExternData()){
        let tempDs = getDatasource();
        const DS = tempDs? tempDs[0]: null;
        showDatasource(DS);
        localSafeDatasource(DS);
    } else{
        const DS = await loadLocalDatasource();
        showDatasource(DS);
    }

    ["DsTitle", "DsShortDescription", "DsDate", "DsLink", "DsLicense", "changeDataBtn"]
    .forEach(id => document.getElementById(id).addEventListener("click", openForm));

});

async function updateOnlineStatus() {
    if(online != navigator.online && online == true){
        window.location.reload();
    }
}


const intervallId = setInterval(updateOnlineStatus, 5000);