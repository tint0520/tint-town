let map;
let markers = [];
let currentLayer = "town";

const SHEET_ID = '1i31bdyzutx_67rWCaIgJl7Ir8-FD3mqVeYXk_haEgqM';
const SHEET_NAME = 'TintTown';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=${encodeURIComponent(SHEET_NAME)}`;

// 👇 加入徵 model 有效日期、招募類型（互惠/付費）
const extraLayers = {
  model: [
    {
      name: "徵模特｜皮膚管理",
      link: "https://www.instagram.com/model1",
      type: "皮膚管理",
      tags: "互惠, 作品需求",
      description: "作品集招募，需拍攝過程，可換保養服務",
      latlng: "25.0341,121.5625",
      address: "台北市信義區光復南路99號",
      due: "2025-04-08"
    },
    {
      name: "徵模特｜睫毛嫁接",
      link: "https://www.instagram.com/model2",
      type: "美睫",
      tags: "付費",
      description: "新手睫毛師招募模特，提供車馬費",
      latlng: "24.1478,120.6739",
      address: "台中市西屯區市政北七路88號",
      due: "2025-04-10"
    },
    {
      name: "徵模特｜眉毛設計",
      link: "https://www.instagram.com/model3",
      type: "紋繡",
      tags: "互惠",
      description: "眉型設計互惠方案，需拍攝前後照",
      latlng: "22.6261,120.3134",
      address: "高雄市苓雅區中正一路100號",
      due: "2024-12-30"
    }
  ],
  rent: [
    {
      name: "房東釋出｜獨立工作室",
      link: "https://line.me/r/ti/p/@space001",
      type: "商業空間出租",
      tags: "適合美甲、美睫",
      description: "10坪光線明亮，月租 $8500",
      latlng: "25.0396,121.5623",
      address: "台北市中山區復興北路108號"
    }
  ]
};

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

  if (layer === "town") {
    fetch(SHEET_URL)
      .then(res => res.text())
      .then(data => {
        const json = JSON.parse(data.substr(47).slice(0, -2));
        const rows = json.table.rows;
        const selectedTags = getSelectedValues("type-filter");

        rows.forEach(row => {
          const name = row.c[0]?.v || "";
          const link = row.c[1]?.v || "";
          const type = row.c[2]?.v || "";
          const tags = row.c[3]?.v || "";
          const desc = row.c[4]?.v || "";
          const latlng = row.c[5]?.v || "";
          const address = row.c[6]?.v || "";

          if (!latlng.includes(",")) return;
          const [lat, lng] = latlng.split(",").map(Number);
          const tagList = tags.split(/,|、/).map(t => t.trim());
          if (!tagList.some(t => selectedTags.includes(t))) return;

          const marker = new google.maps.Marker({ position: { lat, lng }, map, title: name });
          const info = new google.maps.InfoWindow({
            content: `
              <div>
                <strong>${name}</strong><br/>
                <em>${type}</em><br/>
                ${tags}<br/>
                ${desc}<br/>
                <a href="${link}" target="_blank">🔗 點我看連結</a><br/>
                <small>${address}</small>
              </div>
            `
          });
          marker.addListener("click", () => info.open(map, marker));
          markers.push(marker);
        });
      });
  } else {
    const selectedOffers = getSelectedValues("offer-filter");
    const now = new Date();
    const layerData = extraLayers[layer] || [];

    layerData.forEach(item => {
      const [lat, lng] = item.latlng.split(",").map(Number);
      const tagList = (item.tags || "").split(/,|、/).map(t => t.trim());
      const offerMatch = selectedOffers.length ? tagList.some(t => selectedOffers.includes(t)) : true;

      // 過期判斷
      const isExpired = item.due && new Date(item.due) < now;
      if (layer === "model" && (!offerMatch || isExpired)) return;

      const marker = new google.maps.Marker({ position: { lat, lng }, map, title: item.name });
      const info = new google.maps.InfoWindow({
        content: `
          <div>
            <strong>${item.name}</strong><br/>
            <em>${item.type}</em><br/>
            ${item.tags}<br/>
            ${item.description}<br/>
            ${item.due ? `<small>⏰ 截止：${item.due}</small><br/>` : ""}
            <a href="${item.link}" target="_blank">🔗 點我看連結</a><br/>
            <small>${item.address}</small>
          </div>
        `
      });
      marker.addListener("click", () => info.open(map, marker));
      markers.push(marker);
    });
  }
}
