// Store our API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

// Create a function to determine the color based on depth.
function chooseColor(depth) {
  if (depth <= -10) {
    return "green";
  }
  else if (depth <= 10) {
    return "yellow";
  }
  else if (depth <= 30) {
    return "orange";
  }
  else if (depth <= 50) {
    return "red";
  }
  else if (depth <= 70) {
    return "purple";
  }
  else {
    return "black";
  }
}

// Perform a GET request to the query URL.
d3.json(queryUrl).then(function (data) {
  console.log(data.features);

  // Using the features array sent back in the API data, create a GeoJSON layer, and add it to the map.
  function useFeature(feature, layer) {
    layer.bindPopup("<h3>Magnitude: " + feature.properties.mag + "</h3><h3>Location: " + feature.properties.place + "</h3><h3>Depth: " + feature.geometry.coordinates[2] + "</h3>");
  }

  let earthquakes = L.geoJSON(data.features, {
    style: function (feature) {
      return {
        color: "white",
        fillColor: chooseColor(feature.geometry.coordinates[2]),
        fillOpacity: 0.5,
        radius: feature.properties.mag * 5,
        weight: 1.5
      };
    },
    onEachFeature: useFeature,
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);
    }
  })

  createMap(earthquakes);
});

function createMap(earthquakes) {
  // Create the base layers.
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Create a baseMaps object.
  let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };

  // Create an overlays object.
  let overlayMaps = {
    Earthquakes: earthquakes,
  };

  // Create a new map.
  let myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [street, earthquakes]
  });

// ...

// Create a legend
var legend = L.control({ position: 'bottomright' });
legend.onAdd = function (map) {
  var div = L.DomUtil.create('div', 'info legend');
  var grades = [-10, 10, 30, 50, 70, 90];
  var labels = [];
  var colors = ["green", "yellow", "orange", "red", "purple", "black"];

  // Loop through the depth ranges and create labels with associated colors
  for (var i = 0; i < grades.length; i++) {
    labels.push(
      '<div class="legend-item" style="background-color: ' + colors[i] + '"></div>' +
      grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+')
    );
  }

  // Add the labels to the legend
  div.innerHTML = '<div class="legend-box">' + labels.join('') + '</div>';
  return div;
};
legend.addTo(myMap);
}