let map;
let markers = [];
let currentLayer = "town";

// 你會換成你真實的表單 Sheet ID
const SHEET_ID = '1IapOBmEDnMok0a1qhwGhusfs9Li2AOdhvfCM_VF7c8Y';  // 👈 你之後換掉
const SHEET_NAME = "Tint.Maps";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=${encodeURIComponent(SHEET_NAME)}`;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 25.0330, lng: 121.5654 },
    zoom: 13,
  });

  const filters = document.querySelectorAll('#filter-box input[type="checkbox"]');
  filters.forEach(input => input.addEventListener('change', () => switchLayer(currentLayer)));

  loadLayer("town");
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
  loadLayer(layer);
}

function loadLayer(layer) {
  clearMarkers();

  fetch(SHEET_URL)
    .then(res => res.text())
    .then(data => {
      const json = JSON.parse(data.substr(47).slice(0, -2));
      const rows = json.table.rows;

      const selectedTags = getSelectedValues("type-filter");
      const selectedOffers = getSelectedValues("offer-filter");
      const now = new Date();

      rows.forEach(row => {
        const role = row.c[0]?.v?.trim() || "";
        const name = row.c[1]?.v || "";
        const link = row.c[2]?.v || "";
        const type = row.c[3]?.v || "";
        const tags = row.c[4]?.v || "";
        const desc = row.c[5]?.v || "";
        const offerType = row.c[6]?.v || "";
        const due = row.c[7]?.v || "";
        const latlng = row.c[8]?.v || "";
        const address = row.c[9]?.v || "";

        if (!latlng.includes(",")) return;
        const [lat, lng] = latlng.split(",").map(Number);

        // 層級過濾
        if ((layer === "town" && role !== "店家") ||
            (layer === "model" && role !== "Model") ||
            (layer === "rent" && role !== "房源")) return;

        // 類型過濾（如：美甲、美睫）
        const tagList = tags.split(/,|、/).map(t => t.trim());
        const matchTags = tagList.some(t => selectedTags.includes(t));
        if (layer === "town" && !matchTags) return;

        // 互惠/付費過濾
        const offerList = offerType.split(/,|、/).map(t => t.trim());
        const matchOffer = offerList.some(t => selectedOffers.includes(t));
        if (layer === "model" && selectedOffers.length && !matchOffer) return;

        // 自動下架過期
        if (layer === "model" && due) {
          const dueDate = new Date(due);
          if (dueDate < now) return;
        }

        const marker = new google.maps.Marker({ position: { lat, lng }, map, title: name });
        const info = new google.maps.InfoWindow({
          content: `
            <div>
              <strong>${name}</strong><br/>
              <em>${type}</em><br/>
              ${tags}<br/>
              ${desc}<br/>
              ${offerType ? `📌 ${offerType}<br/>` : ""}
              ${due ? `⏰ 截止：${due}<br/>` : ""}
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
