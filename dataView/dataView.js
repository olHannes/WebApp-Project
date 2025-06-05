import { initMap, showUserLocation, addDataPoint } from "./mapModule.js";
import { initChart, addDatasetToChart } from "./chartModule.js";
import { Datenquelle, Datensatz } from "../models.js";
import { initializeData, addRandDatasources } from "../init.js";

initMap();
showUserLocation();

initChart();

const dsRaw = window["datasources"].find((d) => d.id === 11);
const testDatasource = new Datenquelle(
    dsRaw.id,
    dsRaw.title,
    dsRaw.short_description,
    dsRaw.long_description,
    dsRaw.update_date,
    dsRaw.data_description_url,
    dsRaw.data_api_url,
    dsRaw.license,
    parseInt(dsRaw.status_code)
);

const datensaetze = window["datasets"];

const datensatzObjekte = datensaetze.map((raw) => {
    const ds = new Datensatz(raw.id, raw.pos_lat, raw.pos_lon);

    for (const key in raw) {
        ds.setAttribute(key, raw[key]);
    }

    const popupText = `ID: ${ds.id}, Temp.: ${raw.temp.toFixed(2)}`;
    addDataPoint(ds.latitude, ds.longitude, popupText);

    testDatasource.addDatensatz(ds);

    return ds;
});

addDatasetToChart(datensatzObjekte);



function showDatasource() {
    let tempDs = getDatasource();
    const DS = tempDs? tempDs[0]: null;

    if (!DS) {
        console.warn("Keine Datenquelle gefunden.");
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
        }
    } catch (e) {
        console.warn("Ungültiges Datum:", DS.updateDate);
    }

    const dApi = DS.apiUrl || null;
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


document.addEventListener("DOMContentLoaded", () => {
    initializeData(window['projects'], window['datasources']);
    addRandDatasources(window['datasets']);
    showDatasource();
});