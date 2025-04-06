let map;
let markers = [];
let userPosition = null;

const SHEET_URL = "https://docs.google.com/spreadsheets/d/12nFTJltWKVTVVBOe5RC9wQ4GWqgqcCO1bFkR-qMFmjs/gviz/tq?tqx=out:json";

function startApp() {
  document.getElementById("popup").style.display = "none";
  initMap();
  getUserLocation();
}

function switchView(view) {
  document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
  const el = document.getElementById(`${view}-view`);
  if (el) el.style.display = 'block';
}

function getUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((pos) => {
      userPosition = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      };
      map.setCenter(userPosition);
      map.setZoom(14);

      new google.maps.Marker({
        position: userPosition,
        map,
        title: "你在這裡",
        icon: {
          url: "https://github.com/tint0520/tint-town/blob/main/person_pin_circle_30dp_B2A8D3_FILL1_wght400_GRAD0_opsz24.png?raw=true",
          scaledSize: new google.maps.Size(44, 44)
        }
      });
    });
  }
}

function initMap() {
  map = new google.maps.Map(document.getElementById("map-view"), {
    center: { lat: 25.034, lng: 121.564 },
    zoom: 12,
  });

  loadMarkers();
}

async function loadMarkers() {
  const res = await fetch(SHEET_URL);
  const text = await res.text();
  const json = JSON.parse(text.substr(47).slice(0, -2));
  const rows = json.table.rows;

  rows.forEach(row => {
    const name = row.c[1]?.v || "";
    const desc = row.c[6]?.v || "";
    const latlng = row.c[8]?.v || "";
    const photo = row.c[10]?.v || "https://i.imgur.com/Vs6fE3r.png";

    if (!latlng.includes(",")) return;
    const [lat, lng] = latlng.split(",").map(Number);

    const marker = new google.maps.Marker({
      position: { lat, lng },
      map,
      title: name,
      icon: {
        url: "https://github.com/tint0520/tint-town/blob/main/local_mall_30dp_EECECD_FILL1_wght400_GRAD0_opsz24.png?raw=true",
        scaledSize: new google.maps.Size(36, 36)
      }
    });

    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="text-align:center;">
          <strong>${name}</strong><br/>
          ${desc}<br/>
          <img src="${photo}" width="80" style="margin-top:4px; border-radius:8px;" />
        </div>
      `
    });

    marker.addListener("click", () => {
      infoWindow.open(map, marker);
    });

    markers.push(marker);
  });
}

function goToMyLocation() {
  getUserLocation();
}
