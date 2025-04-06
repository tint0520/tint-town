let map;
let markers = [];
let swipeData = [];
let userPosition = null;

const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSFvPIuAjnqij_Q7FF4wDWxQwDy382fcmFLe5wNjKms5Zs-ERzyOfeZ8m2KV8NjUr2ug31ClfG4-dBm/pub?output=csv";

function startApp() {
  document.getElementById("popup").style.display = "none";
  document.getElementById("app-header").style.display = "flex";
  document.getElementById("bottom-nav").style.display = "flex";
  document.getElementById("home-view").style.display = "flex";
  switchView("home");
  getUserLocation();
}

function startExploring() {
  switchView("map");
  setTimeout(() => {
    getUserLocation();
    if (!map) initMap();
  }, 200);
}

function switchView(view) {
  document.querySelectorAll(".view").forEach(v => v.style.display = "none");
  document.getElementById(`${view}-view`).style.display = "flex";
}

function getUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      userPosition = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      };
      if (map) {
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
      }
      loadStoreData();
    });
  }
}

function initMap() {
  map = new google.maps.Map(document.getElementById("map-view"), {
    center: { lat: 25.034, lng: 121.564 },
    zoom: 12
  });
  loadStoreData();
}

function loadStoreData() {
  fetch(SHEET_URL)
    .then(res => res.text())
    .then(csv => {
      const rows = csv.trim().split("\n").slice(1).map(line => {
        const [name, link, type, tags, desc, latlng, address, photo] = line.split(",");
        const [lat, lng] = latlng.split(",").map(Number);
        const distance = userPosition ? getDistanceKm(userPosition.lat, userPosition.lng, lat, lng) : 999;
        return { name, link, type, tags, desc, lat, lng, address, photo, distance: distance.toFixed(1) };
      });

      swipeData = rows.sort((a, b) => a.distance - b.distance);
      renderMarkers(rows);
      renderSwipeCards(rows);
    });
}

function renderMarkers(data) {
  markers.forEach(m => m.setMap(null));
  markers = [];
  data.forEach(store => {
    const marker = new google.maps.Marker({
      position: { lat: store.lat, lng: store.lng },
      map,
      title: store.name,
      icon: {
        url: "https://github.com/tint0520/tint-town/blob/main/local_mall_30dp_EECECD_FILL1_wght400_GRAD0_opsz24.png?raw=true",
        scaledSize: new google.maps.Size(36, 36)
      }
    });

    const info = new google.maps.InfoWindow({
      content: `
        <strong>${store.name}</strong><br/>
        ${store.desc}<br/>
        <a href="${store.link}" target="_blank">看店家</a><br/>
        ${store.address}
      `
    });

    marker.addListener("click", () => {
      info.open(map, marker);
    });

    markers.push(marker);
  });
}

function renderSwipeCards(data) {
  const container = document.getElementById("swipe-view");
  container.innerHTML = "";
  data.forEach(store => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${store.photo}" alt="${store.name}" />
      <h3>${store.name}</h3>
      <p>${store.desc}</p>
      <p>📍 距離你約 ${store.distance} km</p>
      <a href="${store.link}" target="_blank">查看 Instagram</a>
    `;
    container.appendChild(card);
  });
}

function getDistanceKm(lat1, lng1, lat2, lng2) {
  const toRad = deg => deg * Math.PI / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function applyTypeFilter() {
  alert("（篩選功能未完成）");
}

function goToMyLocation() {
  getUserLocation();
}
