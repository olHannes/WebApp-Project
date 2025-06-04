import { initMap, showUserLocation, addDataPoint } from "./mapModule.js";
import { initChart, addDatasetToChart } from "./chartModule.js";
import { Datenquelle, Datensatz } from "../models.js";

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





function getDatasourceIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}


function showDatasource(){
    const DS = getDatasource();
    if(!DS) return;

    console.log("found Datasource:\n", DS);
}

function getDatasource(){
    const currentId = getDatasourceIdFromURL();
    if(!currentId) return;

    const datasources = window['datasources'];
    const searchDS = datasources.find((d) => d.id == currentId);
    if(!searchDS) return;

    const currentDatasource = new Datenquelle(
        searchDS.id,
        searchDS.title,
        searchDS.short_description,
        searchDS.long_description,
        null,
        searchDS.data_description_url,
        searchDS.data_api_url,
        searchDS.license,
        searchDS.status_code
    )
    return currentDatasource;
}

document.addEventListener("DOMContentLoaded", showDatasource);