let map;
let markers = [];
let swipeData = [];
let userPosition = null;

// 新的 Google Sheets 連結
const SHEET_URL = "https://docs.google.com/spreadsheets/d/1iKVLOjHA2w29Y96Hlg78hgivnjV-ntx2LJvhFpeiFUs/gviz/tq?tqx=out:json";

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
    const latlng = row.c[5]?.v || "";  // latlng 在第六欄 (index:5)
    if (!latlng.includes(",")) return null;
    const [lat, lng] = latlng.split(",").map(Number);
    const dist = userPosition ? getDistanceKm(userPosition.lat, userPosition.lng, lat, lng) : 999;
    return {
      name: row.c[0]?.v || "",      // name (第一欄)
      link: row.c[1]?.v || "",      // link (第二欄)
      type: row.c[2]?.v || "",      // type (第三欄)
      tags: row.c[3]?.v || "",      // tags (第四欄)
      desc: row.c[4]?.v || "",      // desc (第五欄)
      address: row.c[6]?.v || "",   // address (第七欄)
      hours: row.c[7]?.v || "",     // hours (第八欄)
      ig: row.c[8]?.v || "",        // ig (第九欄)
      line: row.c[9]?.v || "",      // line (第十欄)
      distance: dist.toFixed(1),
      lat, lng,
      photo: "https://i.imgur.com/Vs6fE3r.png" // 可自訂圖片來源或 Sheets 新增圖片欄位
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
      <p>類型：${store.type}</p>
      <p>標籤：${store.tags}</p>
      <p>📍 ${store.address}</p>
      <p>🕒 ${store.hours}</p>
      <p>📶 距離你約 ${store.distance} km</p>
      ${store.link ? `<a href="${store.link}" target="_blank">網站</a>` : ''}
      ${store.ig ? `<a href="${store.ig}" target="_blank">IG</a>` : ''}
      ${store.line ? `<a href="${store.line}" target="_blank">LINE</a>` : ''}
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
