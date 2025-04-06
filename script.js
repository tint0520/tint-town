let map;
let markers = [];
let currentLayer = "town";
let swipeData = [];

const SHEET_URL = "https://docs.google.com/spreadsheets/d/12nFTJltWKVTVVBOe5RC9wQ4GWqgqcCO1bFkR-qMFmjs/gviz/tq?tqx=out:json";

function startApp() {
  document.getElementById("popup").style.display = "none";
  document.getElementById("home-view").style.display = "flex";
  switchView("home");
  getUserLocation();
}

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 25.034, lng: 121.564 },
    zoom: 12,
  });

  switchLayer("town");
  loadSwipeData();
}

function getUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

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
    });
  }
}

function getSelectedValues(className) {
  return Array.from(document.querySelectorAll(`.${className}:checked`)).map(i => i.value.trim());
}

function clearMarkers() {
  markers.forEach(m => m.setMap(null));
  markers = [];
}

function switchLayer(layer) {
  currentLayer = layer;
  document.querySelectorAll('.filter-section').forEach(section => {
    section.style.display = section.getAttribute('data-layer') === layer ? 'block' : 'none';
  });
  loadLayer(layer);
}

function loadLayer(layer) {
  clearMarkers();

  fetch(SHEET_URL)
    .then(res => res.text())
    .then(text => {
      const json = JSON.parse(text.substr(47).slice(0, -2));
      const rows = json.table.rows;

      const selectedTags = getSelectedValues("type-filter");

      rows.forEach(row => {
        const name = row.c[1]?.v || "";
        const link = row.c[2]?.v || "";
        const desc = row.c[6]?.v || "";
        const latlng = row.c[8]?.v || "";
        const address = row.c[9]?.v || "";
        const photo = row.c[10]?.v || "https://i.imgur.com/Vs6fE3r.png";

        if (!latlng.includes(",")) return;
        const [lat, lng] = latlng.split(",").map(Number);
        const tags = row.c[3]?.v || "";
        const tagList = tags.split(/,|、/).map(t => t.trim());
        if (!tagList.some(t => selectedTags.includes(t))) return;

        const marker = new google.maps.Marker({
          position: { lat, lng },
          map,
          title: name,
          icon: {
            url: 'https://github.com/tint0520/tint-town/blob/main/local_mall_30dp_EECECD_FILL1_wght400_GRAD0_opsz24.png?raw=true',
            scaledSize: new google.maps.Size(40, 40)
          }
        });

        marker.addListener("click", () => {
          showCard({ name, desc, address, link, photo });
        });

        markers.push(marker);
      });
    });
}

async function loadSwipeData() {
  const res = await fetch(SHEET_URL);
  const text = await res.text();
  const json = JSON.parse(text.substr(47).slice(0, -2));
  const rows = json.table.rows;
  swipeData = rows.map(row => ({
    name: row.c[1]?.v || "",
    desc: row.c[6]?.v || "",
    photo: row.c[10]?.v || "https://i.imgur.com/Vs6fE3r.png"
  }));
}

function showCard({ name, desc, address, link, photo }) {
  document.getElementById('card-title').textContent = name;
  document.getElementById('card-desc').textContent = desc;
  document.getElementById('card-address').textContent = `📍 ${address}`;
  document.getElementById('card-link').href = link;
  document.getElementById('card-link').style.display = link ? "inline-block" : "none";

  const imgEl = document.getElementById('card-img');
  imgEl.src = photo || "https://i.imgur.com/Vs6fE3r.png";
  imgEl.alt = name;

  document.getElementById('info-card').style.display = 'block';

  const message = `【Tint 推薦店家】\n${name}\n${desc}\n📍 ${address}\n🔗 ${link}`;
  const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(message)}`;
  document.getElementById('line-share-btn').href = lineUrl;

  const igUrl = photo?.includes("instagram.com") ? photo : "https://instagram.com";
  document.getElementById('ig-link-btn').href = igUrl;

  document.getElementById('threads-copy-btn').dataset.clip = message;
  document.getElementById('threads-copy-btn').dataset.link = link;

  const favBtn = document.getElementById('fav-btn');
  const saved = isFavorited(name);
  favBtn.textContent = saved ? '💖 已收藏' : '🤍 收藏';
  favBtn.dataset.name = name;
}

function closeCard() {
  document.getElementById('info-card').style.display = 'none';
}

function toggleFavorite() {
  const name = document.getElementById('fav-btn').dataset.name;
  let favs = JSON.parse(localStorage.getItem("tintFavs") || "[]");
  if (favs.includes(name)) {
    favs = favs.filter(n => n !== name);
  } else {
    favs.push(name);
  }
  localStorage.setItem("tintFavs", JSON.stringify(favs));
  document.getElementById('fav-btn').textContent = favs.includes(name) ? '💖 已收藏' : '🤍 收藏';
}

function copyToThreads() {
  const btn = document.getElementById('threads-copy-btn');
  const text = btn.dataset.clip || "";
  navigator.clipboard.writeText(text).then(() => {
    alert("已複製！快貼到 Threads 吧！");
  }).catch(() => {
    alert("複製失敗，手動也行喔");
  });
}

function copyLink() {
  const link = document.getElementById('threads-copy-btn').dataset.link || "";
  navigator.clipboard.writeText(link).then(() => {
    alert("連結已複製 🎉");
  }).catch(() => {
    alert("複製失敗 😵");
  });
}
