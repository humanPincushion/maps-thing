var map,
    pins = [],  // a cache for the pins on the map, globally accessible.
    MELBOURNE = {lat: -37.814, lng: 144.963},  // melbourne cbd
    PIN_DELAY = 1000;   // how long to wait before dropping the initial pins.

function init() {
  // create the map instance and cache it globally.
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 13,
    center: MELBOURNE,
    streetViewControl: false,
    disableDoubleClickZoom: true
  });

  // create some example pin instances.
  setTimeout(function() {
    addPin({lat: -37.798, lng: 144.978});
    setTimeout(function() {
      addPin({lat: -37.836, lng: 144.944});
    }, PIN_DELAY);
  }, PIN_DELAY);
}

/**
 * pin class, used to create new instances of markers
 * @param {Object} position the initial lat-long value for the marker.
 */
function Pin(position) {
  // defaults to centre of the visible map.
  position = position || map.getCenter();

  // initialise the instance against the gmaps api
  var pin = new google.maps.Marker({
    map: map,
    draggable: true,
    animation: google.maps.Animation.DROP,
    position: position
  }),

  // create the radius and bind it to this pin instance.
  circle = new google.maps.Circle({
    map: map,
    radius: 1500,     // in meters.
    draggable: true,  // drag the pin and circle to move.
    editable: true,   // handlebars on radius.
    fillColor: '#fda72d',
    fillOpacity: 0.3,
    strokeColor: '#fda72d',
    strokeWeight: 2
  });
  circle.bindTo('center', pin, 'position');

  // if you click on an instance of a pin, make it bounce. used to quickly
  //   test that instances have isolated scope.
  pin.addListener('click', function toggleBounce() {
    if (pin.getAnimation() !== null) {
      pin.setAnimation(null);
    } else {
      pin.setAnimation(google.maps.Animation.BOUNCE);
    }
  });

  // update the location information, and keep it up to date when moved.
  updateMeta();
  google.maps.event.addListener(pin, 'dragend', updateMeta);
  google.maps.event.addListener(circle, 'radius_changed', updateMeta);

  /**
   * update the location and radius information in the upper right of the window
   * as an example of the data that is available when a pin is moved.
   */
  function updateMeta() {
    var latlng = pin.getPosition();     // returns a latlong object.
        radius = circle.getRadius(),
        formattedRadius = (Math.round(radius*100)/100) + 'm',
        geocoder = new google.maps.Geocoder();

    document.getElementById('latlng').innerHTML = latlng.toString();
    document.getElementById('radius').innerHTML = formattedRadius;

    // translate the latlong into a real world address.
    geocoder.geocode({ latLng: latlng },
      function(results, status) {
        // if the translation call was successful, update the ui.
        if (status == google.maps.GeocoderStatus.OK) {
          document.getElementById('address').innerHTML = results[0].formatted_address;
        } else {
          document.getElementById('address').innerHTML = '';
        }
      }
    );
  }

  // remove pin instances on double click.
  google.maps.event.addListener(pin, 'dblclick', selfDestruct);
  google.maps.event.addListener(circle, 'dblclick', selfDestruct);

  // removes a pin and it's bound circle.
  function selfDestruct() {
    pin.setMap(null);
    circle.setMap(null);
  }

};

/**
 * creates a new pin instance and caches it on the pin stack.
 * @param {Object} position the initial lat-long value for the marker.
 */
function addPin(position) {
  pins.push( new Pin(position) );
}

// bind the add pin button to the approriate functionality.
document.getElementById('addPin').addEventListener('click', function(event) {
	event.preventDefault();
  addPin();
});

// init
google.maps.event.addDomListener(window, 'load', init);
