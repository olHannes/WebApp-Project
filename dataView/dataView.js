import { initMap, showUserLocation, addDataPoint } from "./mapModule.js";
import { initChart, addDatasetToChart } from "./chartModule.js";
import { Datenquelle, Datensatz } from "../models.js";
import { initializeData, addRandDatasources } from "../init.js";



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

    const datasets = DS.datensaetze;
    if(datasets){
        renderExampleDataMap(datasets);
        renderExampleDataChart(datasets);
    }    
}

function renderExampleDataMap(datasets){
    initMap();
    showUserLocation();

    datasets.forEach(element => {
        const popupText = `ID: ${element.id}, Temp.: ${element.attributes.temp.toFixed(2)}`;
        addDataPoint(element.latitude, element.longitude, popupText);
    });
}

function renderExampleDataChart(datasets){
    initChart("Temperature (°C)");
    addDatasetToChart(datasets);
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