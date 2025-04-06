let map;
let markers = [];
let swipeData = [];
let userPosition = null;

const SHEET_URL = "https://docs.google.com/spreadsheets/d/1YsGmD_2EtrwjypWZqMU1n9H_pn-6NhZQcawC_-CpAN8/gviz/tq?tqx=out:json";

function startApp() {
  document.getElementById("popup").style.display = "none";
  switchView("home");
}

function startExploring() {
  switchView('map');
  setTimeout(() => {
    getUserLocation();
    if (!map) initMap();
  }, 200);
}

function initMap() {
  map = new google.maps.Map(document.getElementById("map-view"), {
    center: { lat: 25.034, lng: 121.564 },
    zoom: 13,
  });
  loadSwipeData();
}

function getUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      userPosition = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      if (map) {
        map.setCenter(userPosition);
        map.setZoom(14);
      }
      new google.maps.Marker({
        position: userPosition,
        map,
        title: "你在這裡",
        icon: {
          url: 'https://github.com/tint0520/tint-town/blob/main/person_pin_circle_30dp_B2A8D3_FILL1_wght400_GRAD0_opsz24.png?raw=true',
          scaledSize: new google.maps.Size(44, 44)
        }
      });
      loadSwipeData();
    });
  }
}

function getDistanceKm(lat1, lng1, lat2, lng2) {
  const toRad = deg => deg * Math.PI / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function loadSwipeData() {
  const res = await fetch(SHEET_URL);
  const text = await res.text();
  const json = JSON.parse(text.substr(47).slice(0, -2));
  const rows = json.table.rows;

  swipeData = rows.map(row => {
    const latlng = row.c[8]?.v || "";
    if (!latlng.includes(",")) return null;
    const [lat, lng] = latlng.split(",").map(Number);
    const dist = userPosition ? getDistanceKm(userPosition.lat, userPosition.lng, lat, lng) : 999;
    return {
      name: row.c[1]?.v || "",
      desc: row.c[6]?.v || "",
      photo: row.c[10]?.v || "https://i.imgur.com/Vs6fE3r.png",
      address: row.c[9]?.v || "地址未提供",
      distance: dist.toFixed(1),
      lat, lng
    };
  }).filter(Boolean).sort((a,b)=>a.distance-b.distance);

  renderSwipeCard();
}

function renderSwipeCard() {
  const container = document.getElementById("swipe-view");
  container.innerHTML = "";
  swipeData.forEach(store => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${store.photo}" alt="${store.name}" />
      <h3>${store.name}</h3>
      <p>${store.desc}</p>
      <p>📍 ${store.address}</p>
      <p>📶 距離你約 ${store.distance} km</p>
    `;
    container.appendChild(card);

    new google.maps.Marker({
      position: { lat: store.lat, lng: store.lng },
      map,
      title: store.name
    });
  });
}

function switchView(view) {
  document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
  const el = document.getElementById(`${view}-view`);
  if (el) el.style.display = 'flex';
}

function goToMyLocation() {
  getUserLocation();
}
