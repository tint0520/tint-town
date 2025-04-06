const SHEET_URL = "https://docs.google.com/spreadsheets/d/1iKVLOjHA2w29Y96Hlg78hgivnjV-ntx2LJvhFpeiFUs/export?format=csv&gid=0";

let map;

function initMap() {
  map = new google.maps.Map(document.getElementById("map-view"), {
    center: { lat: 25.034, lng: 121.564 },
    zoom: 12,
  });
  loadStoreData(); // 確保這裡有被執行
}

function loadStoreData() {
  Papa.parse(SHEET_URL, {
    download: true,
    header: true,
    complete: function(results) {
      results.data.forEach(store => {
        if (!store.latlng || !store.latlng.includes(",")) return;

        const [lat, lng] = store.latlng.split(",").map(Number);

        const marker = new google.maps.Marker({
          position: { lat, lng },
          map,
          title: store.name
        });

        const infoContent = `
          <h3>${store.name}</h3>
          <p>${store.desc || ''}</p>
          <p>📍 ${store.address || ''}</p>
          <p>⏰ ${store.hours || ''}</p>
          ${store.photo ? `<img src="${store.photo}" style="width:100%;max-width:200px;border-radius:8px;margin-top:10px;">` : ''}
        `;

        const infoWindow = new google.maps.InfoWindow({
          content: infoContent
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });
      });
    }
  });
}

function startApp() {
  document.getElementById("popup").style.display = "none";
  switchView("home");
}

function startExploring() {
  switchView('map');
}

function switchView(view) {
  document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
  document.getElementById(`${view}-view`).style.display = 'flex';
}
