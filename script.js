let map;
let markers = [];
let currentLayer = "town";

const SHEET_ID = '12nFTJltWKVTVVBOe5RC9wQ4GWqgqcCO1bFkR-qMFmjs';
const SHEET_NAME = 'Tint Maps';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=${encodeURIComponent(SHEET_NAME)}`;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 25.0330, lng: 121.5654 },
    zoom: 13,
  });

  const filters = document.querySelectorAll('#filter-box input[type="checkbox"]');
  filters.forEach(input => input.addEventListener('change', () => switchLayer(currentLayer)));

  switchLayer("town");
}

function clearMarkers() {
  markers.forEach(m => m.setMap(null));
  markers = [];
}

function getSelectedValues(className) {
  return Array.from(document.querySelectorAll(`.${className}:checked`)).map(i => i.value.trim());
}

function switchLayer(layer) {
  currentLayer = layer;
  clearMarkers();

  fetch(SHEET_URL)
    .then(res => res.text())
    .then(data => {
      const json = JSON.parse(data.substr(47).slice(0, -2));
      const rows = json.table.rows;
      const now = new Date();

      rows.forEach(row => {
        const category = row.c[0]?.v || ""; // 類型
        const name = row.c[1]?.v || "";
        const link = row.c[2]?.v || "";
        const type = row.c[3]?.v || "";
        const tags = row.c[4]?.v || "";
        const desc = row.c[5]?.v || "";
        const due = row.c[6]?.v || "";
        const latlng = row.c[7]?.v || "";
        const address = row.c[8]?.v || "";

        if (category !== layer) return;
        if (!latlng.includes(",")) return;

        const [lat, lng] = latlng.split(",").map(Number);

        // 篩選類別 / 招募條件
        const tagList = tags.split(/,|、/).map(t => t.trim());
        const selectedType = getSelectedValues("type-filter");
        const selectedTag = getSelectedValues("offer-filter");

        if (layer === "town" && !tagList.some(t => selectedType.includes(t))) return;
        if (layer === "model") {
          if (!tagList.some(t => selectedTag.includes(t))) return;
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
