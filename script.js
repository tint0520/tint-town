const SHEET_URL = "https://docs.google.com/spreadsheets/d/12nFTJltWKVTVVBOe5RC9wQ4GWqgqcCO1bFkR-qMFmjs/gviz/tq?tqx=out:json";

// 這裡自己換成你有設「公開成 JSON 的」Google Sheet 網址，不然沒資料跑出來

async function initMap() {
  const map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 25.034, lng: 121.564 }, // 預設台北
    zoom: 12,
  });

  const response = await fetch(SHEET_URL);
  const text = await response.text();
  const json = JSON.parse(text.substr(47).slice(0, -2));
  const rows = json.table.rows;

  rows.forEach((row) => {
    const name = row.c[1]?.v || "";
    const link = row.c[2]?.v || "";
    const latlng = row.c[8]?.v || "";
    const desc = row.c[6]?.v || "";
    const address = row.c[9]?.v || "";

    if (!latlng) return;

    const [lat, lng] = latlng.split(",").map(Number);
    const marker = new google.maps.Marker({
      position: { lat, lng },
      map,
      title: name,
    });

    const infowindow = new google.maps.InfoWindow({
      content: `
        <div>
          <strong>${name}</strong><br>
          ${desc}<br>
          <a href="${link}" target="_blank">更多資訊</a><br>
          <small>${address}</small>
        </div>
      `
    });

    marker.addListener("click", () => {
      infowindow.open(map, marker);
    });
  });
}

window.initMap = initMap;
