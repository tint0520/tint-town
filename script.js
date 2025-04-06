let map;
let swipeData = [];
let userPosition = null;

const SHEET_URL = "https://docs.google.com/spreadsheets/d/12nFTJltWKVTVVBOe5RC9wQ4GWqgqcCO1bFkR-qMFmjs/gviz/tq?tqx=out:json";
function startApp() {
  document.getElementById("popup").style.display = "none";
  document.getElementById("home-view").style.display = "flex";
  switchView("home");
  getUserLocation();
}

function startExploring() {
  switchView('map');
  setTimeout(() => {
    getUserLocation();
    if (!map) initMap();
  }, 200);
}

function switchView(view) {
  document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
  document.getElementById(`${view}-view`).style.display = 'flex';
}

function getUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((pos) => {
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
            url: 'https://github.com/tint0520/tint-town/blob/main/person_pin_circle_30dp_B2A8D3_FILL1_wght400_GRAD0_opsz24.png?raw=true',
            scaledSize: new google.maps.Size(44, 44)
          }
        });
      }

      loadSwipeData();
    });
  }
}

function initMap() {
  map = new google.maps.Map(document.getElementById("map-view"), {
    center: { lat: 25.034, lng: 121.564 },
    zoom: 12,
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

async function loadSwipeData() {
  const res = await fetch(SHEET_URL);
  const csv = await res.text();
  const rows = csv.trim().split('\n').slice(1).map(row => row.split(','));

  swipeData = rows.map(r => {
    const [name, igLink, type, tags, desc, line, phone, web, latlng, addr, photo] = r;
    if (!latlng || !latlng.includes(",")) return null;
    const [lat, lng] = latlng.split(",").map(Number);
    const distance = userPosition ? getDistanceKm(userPosition.lat, userPosition.lng, lat, lng).toFixed(1) : "-";
    return {
      name, desc, photo, distance,
      ig: igLink, line, phone, web, lat, lng
    };
  }).filter(Boolean);

  swipeData.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
  renderSwipeCards();
}

function renderSwipeCards() {
  const container = document.getElementById("swipe-view");
  container.innerHTML = "";

  swipeData.forEach(store => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <button class="share-btn" onclick="shareStore('${store.name}', '${store.web || store.ig || ""}')">🔗</button>
      <img src="${store.photo}" alt="${store.name}" />
      <h3>${store.name}</h3>
      <p>${store.desc}</p>
      <p>📍 距離你約 ${store.distance} km</p>
      ${store.ig ? `<a href="${store.ig}" target="_blank">IG</a>` : ""}
      ${store.line ? `<a href="${store.line}" target="_blank">LINE</a>` : ""}
    `;
    container.appendChild(card);
  });
}

function shareStore(name, link) {
  const shareLink = link || window.location.href;
  if (navigator.share) {
    navigator.share({
      title: name,
      url: shareLink
    });
  } else {
    navigator.clipboard.writeText(shareLink).then(() => {
      alert("連結已複製");
    });
  }
}

function applyTypeFilter() {
  alert("（篩選功能待新增）");
}

function goToMyLocation() {
  getUserLocation();
}
