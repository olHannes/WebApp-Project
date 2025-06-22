let map;

export function initMap() {
  if (map){
    return map;
  }
  map = L.map('map').setView([51.1657, 10.4515], 6); //initial view is Germany

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);
}

  export function addDataPoint(lat, lng, popupText = 'Neuer Eintrag') {
  if (!map) return;
  const marker = L.marker([lat, lng]).addTo(map);
  marker.bindPopup(popupText).openPopup();
}

export function showUserLocation() {
  if (!map) return;

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const userMarker = L.marker([latitude, longitude]).addTo(map);
        userMarker.bindPopup('Dein Standort').openPopup();
        map.setView([latitude, longitude], 11);
      },
      () => alert("Standort konnte nicht ermittelt werden.")
    );
  } else {
    alert("Geolocation wird von Ihrem Browser nicht unterstützt.");
  }
}
