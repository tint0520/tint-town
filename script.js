const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/1FAIpQLSeV1IPI_xuS7j3edFxRbyP9CJzgCKQ5Zn6TuJmrZcYK0VBxIQ/gviz/tq?tqx=out:json";

async function initMap() {
  const map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 25.034, lng: 121.564 },
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

    const infoWindow = new google.maps.InfoWindow({
      content: `<strong>${name}</strong><br>${desc}<br><a href="${link}" target="_blank">${link}</a><br>${address}`,
    });

    marker.addListener("click", () => {
      infoWindow.open(map, marker);
    });
  });
}
