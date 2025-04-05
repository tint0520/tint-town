{\rtf1\ansi\ansicpg950\cocoartf2818
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 .AppleSystemUIFontMonospaced-Regular;}
{\colortbl;\red255\green255\blue255;\red14\green14\blue14;}
{\*\expandedcolortbl;;\cssrgb\c6700\c6700\c6700;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx560\tx1120\tx1680\tx2240\tx2800\tx3360\tx3920\tx4480\tx5040\tx5600\tx6160\tx6720\sl324\slmult1\pardirnatural\partightenfactor0

\f0\fs28 \cf2 const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/1FAIpQLSeV1IPI_xuS7j3edFxRbyP9CJzgCKQ5Zn6TuJmrZcYK0VBxIQ/gviz/tq?tqx=out:json";\
\
async function initMap() \{\
  const map = new google.maps.Map(document.getElementById("map"), \{\
    center: \{ lat: 25.034, lng: 121.564 \},\
    zoom: 12,\
  \});\
\
  const response = await fetch(SHEET_URL);\
  const text = await response.text();\
  const json = JSON.parse(text.substr(47).slice(0, -2));\
\
  const rows = json.table.rows;\
\
  rows.forEach((row) => \{\
    const name = row.c[1]?.v || "\uc0\u26410 \u21629 \u21517 ";\
    const link = row.c[2]?.v || "";\
    const latlng = row.c[8]?.v || "";\
    const desc = row.c[6]?.v || "";\
    const address = row.c[9]?.v || "";\
\
    if (!latlng) return;\
\
    const [lat, lng] = latlng.split(",").map((s) => parseFloat(s));\
\
    const marker = new google.maps.Marker(\{\
      position: \{ lat, lng \},\
      map,\
      title: name,\
    \});\
\
    const infoWindow = new google.maps.InfoWindow(\{\
      content: `\
        <strong>$\{name\}</strong><br>\
        <a href="$\{link\}" target="_blank">$\{link\}</a><br>\
        <em>$\{desc\}</em><br>\
        $\{address\}\
      `,\
    \});\
\
    marker.addListener("click", () => \{\
      infoWindow.open(map, marker);\
    \});\
  \});\
\}}