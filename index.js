// import modules
import "ol/ol.css"
import { Map, View, Feature } from 'ol'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
import { defaults as defaultControls, ScaleLine,ZoomSlider,ZoomToExtent} from 'ol/control'
import VectorSource from 'ol/source/Vector'
import {  Vector as VectorLayer } from 'ol/layer'
import { Circle, Fill, Stroke, Style } from 'ol/style.js';
import Overlay from 'ol/Overlay.js';
import {  fromLonLat } from "ol/proj"
import Point from "ol/geom/Point"

// get information container
var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');

// define view
const view = new View({
  projection: 'EPSG:4326',
  center: [37.0400, -0.7839],
  zoom: 13
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
    new ZoomSlider(),
    new ZoomToExtent({
      extent: [
        36.70170233932109, -1.0942626313459929, 37.41451596564397, -0.567184137048762
      ]
    })
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
  const feature = map.forEachFeatureAtPixel(evt.pixel, function(feature) {
    return feature;
  });
  
  if (feature) {
    const properties = feature.getProperties();
    const coordinate = evt.coordinate;
    
    content.innerHTML = `
      <h3>${properties.name}</h3>
      <p><strong>Address:</strong> <a href="http://maps.google.com/?q=${properties.name}+${properties.address}">${properties.address}</a></p>
      <p><strong>Phone:</strong> <a href='tel: ${properties.phone}'>${properties.phone}</a></p>
      <p><strong>Website:</strong> <a href="${properties.website}" target="_blank">${properties.website}</a></p>
      <button class="google-maps-button" onclick="window.open('http://maps.google.com/?q=${properties.name}+${properties.address}', '_blank')">Open in Google Maps</button>
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
    
    // Optionally fit the view to show all features
    // if (features.length > 0) {
    //   map.getView().fit(vectorSource.getExtent(), {
    //     padding: [50, 50, 50, 50],
    //     duration: 1000
    //   });
    // }
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
                            if (typeof city.longitude === 'number' && typeof city.latitude === 'number') {
                              map.getView().animate({
                                  center: [city.longitude, city.latitude],
                                  zoom: 10
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
        view.setCenter(userCoords);
        view.setZoom(12); // Zoom level for a good local view

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
        map.getView().setCenter([-0.7839, 37.0400]); // Your default coordinates
        map.getView().setZoom(13);
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