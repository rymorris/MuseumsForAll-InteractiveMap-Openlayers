// import modules
import "ol/ol.css"
import { Map, View, Feature } from 'ol/index.js'
import TileLayer from 'ol/layer/Tile.js'
import OSM from 'ol/source/OSM.js'
import { defaults as defaultControls, ScaleLine} from 'ol/control.js'
import VectorSource from 'ol/source/Vector.js'
import {  Vector as VectorLayer } from 'ol/layer.js'
import { Circle, Fill, Stroke, Style } from 'ol/style.js';
import Overlay from 'ol/Overlay.js';
import {  fromLonLat } from "ol/proj.js"
import Point from "ol/geom/Point.js"

// get information container
var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');

// define view
const view = new View({
  projection: 'EPSG:3857',
  center: [-10198538, 5535775],
  zoom: 3
})

var vectorSource = new VectorSource();
var vector = new VectorLayer({
  source: vectorSource,
  style: new Style({
    stroke: new Stroke({
      color: 'rgba(0, 0, 255, 1.0)',
      width: 2
    })
  })
});

/**
       * Create an overlay to anchor the popup to the map.
       */
var overlay = new Overlay({
  element: container,
  autoPan: true,
  autoPanAnimation: {
    duration: 250
  }
});


/**
 * Add a click handler to hide the popup.
 *  Don't follow the href.
 */
closer.onclick = function () {
  overlay.setPosition(undefined);
  closer.blur();
  return false;
};

// define map
const map = new Map({
  controls: defaultControls().extend([
    new ScaleLine({
      units: 'degrees'
    }),
  ]),
  target: 'map',
  overlays: [overlay],
  layers: [
    new TileLayer({
      source: new OSM()
    }),
    vector
  ],
  view: view
})


$(document).ready(function () {

  $('.content-close-button').click(function () {
    $('.content-close-button').hide();
    $('.content').hide();
    $('.site-main').removeClass('has-content-open')

    // When the map is resized programmatically, window resize must be triggered so that the map renders in the newly allotted space.
    window.dispatchEvent(new Event('resize'));

  });

  $('.content-link').click(function () {
    $('.content-close-button').show();
    $('.content').show();
    $('.site-main').addClass('has-content-open')
    window.dispatchEvent(new Event('resize'));
  });

});


// Add click handler to the map
map.on('click', function(evt) {
  evt.stopPropagation();

  const feature = map.forEachFeatureAtPixel(evt.pixel, function(feature) {
    return feature;
  });
  
  console.log('Feature:', feature);
  if (feature) {
    const properties = feature.getProperties();
    const coordinate = evt.coordinate;
    
    content.innerHTML = `
      <h3>${properties.name}</h3>
      <p><svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" fill="#373737" class="bi bi-geo-alt-fill" viewBox="0 0 16 16">
  <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"/>
</svg> <a target="_blank" href="http://maps.google.com/?q=${encodeURIComponent(properties.name)}+${encodeURIComponent(properties.address)}">${properties.address}</a></p>
      <p><svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" fill="#373737" class="bi bi-telephone-fill" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.68.68 0 0 0 .178.643l2.457 2.457a.68.68 0 0 0 .644.178l2.189-.547a1.75 1.75 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.6 18.6 0 0 1-7.01-4.42 18.6 18.6 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877z"/>
</svg> <a target="_blank" href='tel: ${properties.phone}'>${properties.phone}</a></p>
      <p><svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" fill="#373737" class="bi bi-globe" viewBox="0 0 16 16">
  <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m7.5-6.923c-.67.204-1.335.82-1.887 1.855A8 8 0 0 0 5.145 4H7.5zM4.09 4a9.3 9.3 0 0 1 .64-1.539 7 7 0 0 1 .597-.933A7.03 7.03 0 0 0 2.255 4zm-.582 3.5c.03-.877.138-1.718.312-2.5H1.674a7 7 0 0 0-.656 2.5zM4.847 5a12.5 12.5 0 0 0-.338 2.5H7.5V5zM8.5 5v2.5h2.99a12.5 12.5 0 0 0-.337-2.5zM4.51 8.5a12.5 12.5 0 0 0 .337 2.5H7.5V8.5zm3.99 0V11h2.653c.187-.765.306-1.608.338-2.5zM5.145 12q.208.58.468 1.068c.552 1.035 1.218 1.65 1.887 1.855V12zm.182 2.472a7 7 0 0 1-.597-.933A9.3 9.3 0 0 1 4.09 12H2.255a7 7 0 0 0 3.072 2.472M3.82 11a13.7 13.7 0 0 1-.312-2.5h-2.49c.062.89.291 1.733.656 2.5zm6.853 3.472A7 7 0 0 0 13.745 12H11.91a9.3 9.3 0 0 1-.64 1.539 7 7 0 0 1-.597.933M8.5 12v2.923c.67-.204 1.335-.82 1.887-1.855q.26-.487.468-1.068zm3.68-1h2.146c.365-.767.594-1.61.656-2.5h-2.49a13.7 13.7 0 0 1-.312 2.5m2.802-3.5a7 7 0 0 0-.656-2.5H12.18c.174.782.282 1.623.312 2.5zM11.27 2.461c.247.464.462.98.64 1.539h1.835a7 7 0 0 0-3.072-2.472c.218.284.418.598.597.933M10.855 4a8 8 0 0 0-.468-1.068C9.835 1.897 9.17 1.282 8.5 1.077V4z"/>
</svg> <a target="_blank" href="${properties.website}">${properties.website}</a></p>
      <a target="_blank" href="http://maps.google.com/?q=${encodeURIComponent(properties.name)}+${encodeURIComponent(properties.address)}"><button class="google-maps-button">Open in Google Maps</button></a>
      <p class="disclaimer">Map is approximate - Use Google Maps for directions.</p>
    `;

    overlay.setPosition(coordinate);
  } else {
    overlay.setPosition(undefined);
    closer.blur();
  }
});

// Close popup when X is clicked
closer.onclick = function() {
  overlay.setPosition(undefined);
  closer.blur();
  return false;
};


function loadMuseumsToMap() {
// Fetch and process the JSON data
fetch('combined.json', {
    // Add CORS headers to the request
    headers: {
      'Accept': 'application/json'
    },
})
  .then(response => response.json())
  .then(institutions => {
    console.log('Institutions:', institutions); 
    const features = institutions.map(institution => {
      // Convert coordinates to the map's projection
      const coords = fromLonLat(
        [institution.coordinates.longitude, institution.coordinates.latitude],
        view.getProjection()
      );
      
      // Create a point feature
      const point = new Point(coords);
      const feature = new Feature({
        geometry: point,
        ...institution // Spread all institution properties
      });
      
      // Style the point
      feature.setStyle(new Style({
        image: new Circle({
          radius: 6,
          fill: new Fill({
            color: 'rgba(255, 0, 0, 0.8)'
          }),
          stroke: new Stroke({
            color: 'rgba(0, 0, 0, 0.8)',
            width: 1
          })
        })
      }));
      
      return feature;
    });
    
    // Add all features to the vector source
    vectorSource.addFeatures(features);
    
  })
  .catch(error => {
    console.error('Error loading JSON data:', error);
    content.innerHTML = `<p>Error loading data: ${error.message}</p>`;
  });
}

document.addEventListener('DOMContentLoaded', function () {
  console.log('DOM loaded');
  getUserLocationAndSetMap();
  loadMuseumsToMap();
  // Load the JSON data
  fetch('USCities.json', {
    // Add CORS headers to the request
    headers: {
      'Accept': 'application/json',
      accessControlAllowOrigin: '*'
    },
})
      .then(response => response.json())
      .then(data => {
        console.log(data)
          const cityInput = document.getElementById('cityInput');
          const resultsDiv = document.getElementById('results');

          // Function to perform the search
          const performSearch = () => {
              const searchTerm = cityInput.value.trim().toLowerCase();

              // Clear previous results
              resultsDiv.innerHTML = '';

              // Only search if the input length is greater than 4
              if (searchTerm.length > 2) {
                  const filteredCities = data.filter(city => city.city.toLowerCase().includes(searchTerm));

                  if (filteredCities.length > 0) {
                    console.log(filteredCities)
                      filteredCities.forEach(city => {
                          const cityInfo = document.createElement('li');
                          cityInfo.textContent = `${city.city}, ${city.state} `;
                          cityInfo.style.cursor = 'pointer';
                          cityInfo.addEventListener('click', () => {
                            // Set the input value to the selected city
                            cityInput.value = `${city.city}, ${city.state}`;

                            // Center the map on the selected city
                            if (typeof city.longitude === 'number' && typeof city.latitude === 'number') {
                              const centerCoords = fromLonLat(
                                [city.longitude, city.latitude],
                                view.getProjection() // Optional: specify target projection
                              );
                              map.getView().animate({
                                  center: centerCoords,
                                  zoom: 11
                              });
                          } else {
                              console.error('Invalid coordinates for city:', city);
                          }
                          });
                          resultsDiv.appendChild(cityInfo);
                      });
                  } else {
                      resultsDiv.textContent = 'No cities found.';
                  }
              } else {
                  resultsDiv.textContent = 'Please enter at least 3 characters to search.';
              }
          };

          // Listen for input events on the search field
          cityInput.addEventListener('input', performSearch);
      })
      .catch(error => console.error('Error loading JSON data:', error));
});

// Function to get user location and update map
function getUserLocationAndSetMap() {
  // Check if geolocation is available
  if (navigator.geolocation) {
    // Request user's position
    navigator.geolocation.getCurrentPosition(
      function(position) {
        // Success callback
        const userCoords = [position.coords.longitude, position.coords.latitude];
        
        // Update map view
        const view = map.getView();
        view.setCenter(fromLonLat(userCoords, view.getProjection()));
        view.setZoom(11); // Zoom level for a good local view

        // 5. Create and add vector layer (only if not already added to map)
if (!map.getLayers().getArray().some(layer => layer instanceof VectorLayer)) {
  const vectorLayer = new VectorLayer({
    source: vectorSource
    // Note: We removed the style here since we're styling the feature directly
  });
  map.addLayer(vectorLayer);
}

        console.log('Map centered at user location:', userCoords);
      },
      function(error) {
        // Error callback
        console.error('Error getting location:', error.message);
        // Fallback to default coordinates
        const defaultCoords = fromLonLat(
          [-98.583333, 39.833333],
          view.getProjection() // Optional: specify target projection
        );
        map.getView().setCenter(defaultCoords); // Your default coordinates
        map.getView().setZoom(4);
      },
      {
        enableHighAccuracy: true, // Try to get the most accurate position
        timeout: 5000, // Maximum wait time in milliseconds
        maximumAge: 0 // Don't use a cached position
      }
    );
  } else {
    // Geolocation not supported
    console.log('Geolocation is not supported by this browser');
    // Fallback to default coordinates
  }
}
