let map;
let markers = [];

const SHEET_ID = '1i31bdyzutx_67rWCaIgJl7Ir8-FD3mqVeYXk_haEgqM';
const SHEET_NAME = 'clean_data';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=${SHEET_NAME}`;

const extraLayers = {
  model: [
    {
      name: "徵模特｜水光肌管理",
      link: "https://www.instagram.com/beauty_model_test/",
      type: "皮膚管理",
      tags: "拍攝合作, 作品需求",
      description: "想找願意拍照的合作 model，一起累積作品～",
      latlng: "25.0321,121.5570",
      address: "台北市大安區信義路三段101號"
    }
  ],
  rent: [
    {
      name: "房東釋出｜小型工作室",
      link: "https://line.me/ti/p/rent_space_1",
      type: "商業空間出租",
      tags: "適合美甲、美睫、皮膚管理",
      description: "15坪可自由設計，有窗、可約看，月租 8000",
      latlng: "25.0380,121.5675",
      address: "台北市中山區民權東路二段55號"
    }
  ]
};

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 25.0330, lng: 121.5654 },
    zoom: 13,
  });
  loadLayer("town");
}

function clearMarkers() {
  markers.forEach(m => m.setMap(null));
  markers = [];
}

function switchLayer(layer) {
  clearMarkers();
  if (layer === "town") {
    fetch(SHEET_URL)
      .then(res => res.text())
      .then(data => {
        const json = JSON.parse(data.substr(47).slice(0, -2));
        const rows = json.table.rows;
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

          const marker = new google.maps.Marker({
            position: { lat, lng },
            map: map,
            title: name,
          });

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

          marker.addListener("click", () => {
            info.open(map, marker);
          });

          markers.push(marker);
        });
      });
  } else {
    const layerData = extraLayers[layer] || [];
    layerData.forEach(item => {
      const [lat, lng] = item.latlng.split(",").map(Number);
      const marker = new google.maps.Marker({
        position: { lat, lng },
        map: map,
        title: item.name,
      });
      const info = new google.maps.InfoWindow({
        content: `
          <div>
            <strong>${item.name}</strong><br/>
            <em>${item.type}</em><br/>
            ${item.tags}<br/>
            ${item.description}<br/>
            <a href="${item.link}" target="_blank">🔗 點我看連結</a><br/>
            <small>${item.address}</small>
          </div>
        `
      });
      marker.addListener("click", () => {
        info.open(map, marker);
      });
      markers.push(marker);
    });
  }
}
