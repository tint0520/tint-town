let map;
let markers = [];
let swipeData = [];
let userPosition = null;
let currentIndex = 0;

const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSFvPIuAjnqij_Q7FF4wDWxQwDy382fcmFLe5wNjKms5Zs-ERzyOfeZ8m2KV8NjUr2ug31ClfG4-dBm/pub?output=csv";

function startApp() {
  document.getElementById("popup").style.display = "none";
  switchView("map");  // 直接跳地圖
  getUserLocation();
}

function initMap() {
  map = new google.maps.Map(document.getElementById("map-view"), {
    center: { lat: 25.034, lng: 121.564 },
    zoom: 12,
  });

  document.getElementById("go-my-location").onclick = () => getUserLocation();
}

function getUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      userPosition = pos;

      map.setCenter(pos);
      map.setZoom(14);

      new google.maps.Marker({
        position: pos,
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

function switchView(view) {
  document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
  document.getElementById(`${view}-view`).style.display = 'flex';
}

async function loadSwipeData() {
  const res = await fetch(SHEET_URL);
  const text = await res.text();
  const rows = text.trim().split("\n").slice(1).map(r => r.split(","));

  swipeData = rows.map(r => {
    const name = r[0], link = r[1], type = r[2], tags = r[3], desc = r[4], latlng = r[5], address = r[6], photo = r[7];
    let [lat, lng] = latlng.split(",").map(Number);
    let distance = "--";
    if (userPosition && lat && lng) {
      distance = getDistanceKm(userPosition.lat, userPosition.lng, lat, lng).toFixed(1);
    }
    return { name, desc, photo, address, link, lat, lng, distance };
  });

  swipeData.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
  renderSwipeCard();
  renderMapMarkers();
}

function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) ** 2 + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLng/2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function renderSwipeCard() {
  const container = document.getElementById("swipe-view");
  container.innerHTML = "";

  if (!swipeData.length) return container.innerHTML = "<p>找不到店家</p>";

  const store = swipeData[currentIndex];
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <img src="${store.photo}" alt="${store.name}" />
    <h3>${store.name}</h3>
    <p>${store.desc}</p>
    <p>📍 距離你約 ${store.distance} km</p>
    ${store.link ? `<a href="${store.link}" target="_blank">查看 Instagram</a>` : ""}
    <div style="margin-top:12px;">
      ${currentIndex > 0 ? `<button onclick="prevCard()">⬅️</button>` : ""}
      ${currentIndex < swipeData.length - 1 ? `<button onclick="nextCard()">➡️</button>` : ""}
    </div>
  `;
  container.appendChild(card);
}

function nextCard() {
  if (currentIndex < swipeData.length - 1) {
    currentIndex++;
    renderSwipeCard();
  }
}

function prevCard() {
  if (currentIndex > 0) {
    currentIndex--;
    renderSwipeCard();
  }
}

function renderMapMarkers() {
  markers.forEach(m => m.setMap(null));
  markers = [];

  swipeData.forEach(store => {
    if (store.lat && store.lng) {
      const marker = new google.maps.Marker({
        position: { lat: store.lat, lng: store.lng },
        map,
        title: store.name,
        icon: {
          url: "https://github.com/tint0520/tint-town/blob/main/local_mall_30dp_EECECD_FILL1_wght400_GRAD0_opsz24.png?raw=true",
          scaledSize: new google.maps.Size(32, 32)
        }
      });

      const infowindow = new google.maps.InfoWindow({
        content: `<strong>${store.name}</strong><br>${store.desc}<br>${store.address}`
      });

      marker.addListener("click", () => infowindow.open(map, marker));
      markers.push(marker);
    }
  });
}
