let map;
let markers = [];
let currentLayer = "town";

const SHEET_ID = '1IapOBmEDnMok0a1qhwGhusfs9Li2AOdhvfCM_VF7c8Y';  // 👈 你之後換掉
const SHEET_NAME = "表單回應 1";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 25.0330, lng: 121.5654 },
    zoom: 13,
  });

  const filters = document.querySelectorAll('#filter-box input[type="checkbox"]');
  filters.forEach(input => input.addEventListener('change', () => switchLayer(currentLayer)));

  loadLayer("town");
}

function switchLayer(layer) {
  currentLayer = layer;
  loadLayer(layer);
}

function clearMarkers() {
  markers.forEach(m => m.setMap(null));
  markers = [];
}

function getSelectedValues(className) {
  return Array.from(document.querySelectorAll(`.${className}:checked`)).map(i => i.value.trim());
}

function loadLayer(layer) {
  clearMarkers();
  fetch(SHEET_URL)
    .then(res => res.text())
    .then(txt => {
      const json = JSON.parse(txt.substr(47).slice(0, -2));
      const rows = json.table.rows;

      const selectedTags = getSelectedValues("type-filter");
      const selectedOffers = getSelectedValues("offer-filter");
      const now = new Date();

      rows.forEach(row => {
        const data = row.c.map(c => (c ? c.v : ""));
        const [name, link, type, tags, desc, latlng, address, due, rowLayer] = data;
        if (rowLayer !== layer) return;
        if (!latlng || !latlng.includes(",")) return;
        const [lat, lng] = latlng.split(",").map(Number);

        // 篩選
        const tagList = (tags || "").split(/,|、/).map(t => t.trim());
        if (layer === "town" && !tagList.some(t => selectedTags.includes(t))) return;
        if (layer === "model") {
          if (!tagList.some(t => selectedOffers.includes(t))) return;
          if (due && new Date(due) < now) return;
        }

        const marker = new google.maps.Marker({ position: { lat, lng }, map, title: name });
        const info = new google.maps.InfoWindow({
          content: `
            <div>
              <strong>${name}</strong><br/>
              <em>${type}</em><br/>
              ${tags}<br/>
              ${desc}<br/>
              ${due ? `<small>⏰ 截止：${due}</small><br/>` : ""}
              <a href="${link}" target="_blank">🔗 點我看連結</a><br/>
              <small>${address}</small>
            </div>
          `
        });
        marker.addListener("click", () => info.open(map, marker));
        markers.push(marker);
      });
    });
}
