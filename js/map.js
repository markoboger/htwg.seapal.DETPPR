

// wozu lat/long anzeige? entfernen?
// boger nach ressourcen von f�hnchen fragen
// openseamap fehler normal?

var map = null;

var route = null;
var routeMarkerArray = new Array();
var markerIndex = null;

var MODE = { DEFAULT: { value: 0, name: "default" }, ROUTE: { value: 1, name: "route" } };
var currentMode = MODE.DEFAULT;

var currentPosition = null;
var currentPositionMarker = null;

var temporaryMarker = null;
var temporaryMarkerInfobox = null;
var temporaryMarkerTimeout = null;

var fixedMarker = null;
var fixedMarkerInfoBox = null;
var fixedMarkerCount = 0;
var fixedMarkerArray = new Array();

var selectedMarker = null;

var currentPositionMarkerImage = new google.maps.MarkerImage('../img/boot.png',
    new google.maps.Size(51, 48), //size
    new google.maps.Point(0, 0),  //origin point
    new google.maps.Point(25, 40)  //offset point
);

var temporaryMarkerImage = new google.maps.MarkerImage('../img/cross_hair.png',
    new google.maps.Size(43, 43), //size
    new google.maps.Point(0, 0),  //origin point
    new google.maps.Point(22, 22)  //offset point
);

var fixedMarkerImage = new google.maps.MarkerImage('../img/marker_flag.png',
    new google.maps.Size(28, 31), //size
    new google.maps.Point(0, 0),  //origin point
    new google.maps.Point(0, 30)  //offset point
);

var routeMarkerImage = new google.maps.MarkerImage('../img/route_flag.png',
    new google.maps.Size(28, 31), //size
    new google.maps.Point(0, 0),  //origin point
    new google.maps.Point(0, 30)  //offset point
);


// initialize map and all event listeners
function initialize() {

    // set different map types
    var mapTypeIds = ["roadmap", "satellite", "OSM"];

    // set map Options
    var mapOptions = {
        center: new google.maps.LatLng(47.66, 9.16),
        zoom: 14,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControlOptions: {
            mapTypeIds: mapTypeIds
        }
    };

    //set route menu position
    document.getElementById('routeMenuContainer').style.width = document.getElementById('routeMenu').offsetWidth + "px";
    document.getElementById('routeMenuContainer').style.top = "0px";
    document.getElementById('routeMenuContainer').style.display = "none";

    // initialize map
    map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);

    // set client position
    currentPosition = new google.maps.LatLng(47.66, 9.16)

    var currentMarkerOptions = {
        position: currentPosition,
        map: map,
        icon: currentPositionMarkerImage,
        draggable: true
    }

    // initialize marker for current position
    currentPositionMarker = new google.maps.Marker(currentMarkerOptions);
    currentPositionMarker.setMap(map);

    // set map types
    map.mapTypes.set("OSM", new google.maps.ImageMapType({
        getTileUrl: function (coord, zoom) {
            return "http://tile.openstreetmap.org/" + zoom + "/" + coord.x + "/" + coord.y + ".png";
        },
        tileSize: new google.maps.Size(256, 256),
        name: "OpenStreetMap",
        maxZoom: 18
    }));

    //map.overlayMapTypes.push(new google.maps.ImageMapType({
    //    getTileUrl: function (coord, zoom) {
    //        return "http://tiles.openseamap.org/seamark/" + zoom + "/" + coord.x + "/" + coord.y + ".png";
    //    },
    //    tileSize: new google.maps.Size(256, 256),
    //    name: "OpenSeaMap",
    //    maxZoom: 18
    //}));

    // initialize header with current map center
    document.getElementById("lat").value = map.getCenter().lat();
    document.getElementById("long").value = map.getCenter().lng();

    // center changed
    google.maps.event.addListener(map, 'center_changed', function () {
        document.getElementById("lat").value = map.getCenter().lat();
        document.getElementById("long").value = map.getCenter().lng();;
    });

    // click on map
    google.maps.event.addListener(map, 'click', function (event) {

        // handler for default mode
        if (currentMode == MODE.DEFAULT) {
            setTemporaryMarker(event.latLng);
        } else if (currentMode == MODE.ROUTE) {
            if (route == null) {
                startNewRoute(event.latLng);
            } else {
                setRouteMarker(event.latLng);
            }
        }
    });
}

// temporary marker context menu ----------------------------------------- //
$(function () {
    $.contextMenu({
        selector: '#temporaryMarkerContextMenu',
        events: {
            hide: function () {
                startTimeout();
            }
        },
        callback: function (key, options) {
            if (key == "marker") {

                setFixedMarker(temporaryMarker.position)

            } else if (key == "startroute") {

                startNewRoute(temporaryMarker.position);

            } else if (key == "distance") {

            } else if (key == "destination") {

            } else if (key == "delete") {
                temporaryMarker.setMap(null);
                temporaryMarkerInfobox.setMap(null);
            }
        },
        items: {
            "marker": { name: "Markierung setzen", icon: "marker" },
            "startroute": { name: "Neue Route setzen", icon: "startroute" },
            "distance": { name: "Abstand von hier", icon: "distance" },
            "destination": { name: "Zum Ziel machen", icon: "destination" },
            "delete": { name: "L&ouml;schen", icon: "delete" },
        }
    });
});

// fixed marker context menu ------------------------------------------------ //
$(function () {
    $.contextMenu({
        selector: '#fixedMarkerContextMenu',
        callback: function (key, options) {
            if (key == "destination") {

            } else if (key == "delete") {
                selectedMarker.reference.setMap(null);
                selectedMarker.infobox.setMap(null);
                fixedMarkerArray.splice(fixedMarkerArray.indexOf(selectedMarker), 1);
            }
        },
        items: {
            "destination": { name: "Zum Ziel machen", icon: "destination" },
            "delete": { name: "L&ouml;schen", icon: "delete" },
        }
    });
});

// route context menu ------------------------------------------------ //
$(function () {
    $.contextMenu({
        selector: '#routeContextMenu',
        callback: function (key, options) {
            if (key == "deleteMarker") {
                selectedMarker.setMap(null);
                routeMarkerArray.splice(routeMarkerArray.indexOf(selectedMarker), 1);
                var path = route.getPath();
                path.forEach(function (item, index) {
                    if (path.getAt(index) == selectedMarker.position) {
                        path.removeAt(index);
                    }
                });
            } else if (key == "addMarker") {
                var position = selectedMarker.position;
                var index;
                for (var i = routeMarkerArray.length; i > 0; i--) {
                    if (routeMarkerArray[i - 1].position == position) {
                        index = i;
                        break;
                    }
                }
                setRouteMarker(position, index);
            }
        },
        items: {
            "deleteMarker": { name: "Wegpunkt l&ouml;schen", icon: "deleteMarker" },
            "addMarker": { name: "Wegpunkt hinzuf&uuml;gen", icon: "addMarker" }
        }
    });
});

// helper functions --------------------------------------------------------- //

// start marker timout
function startTimeout() {

    temporaryMarkerTimeout = setTimeout(function () {
        temporaryMarker.setMap(null);
        temporaryMarkerInfobox.setMap(null);
    }, 5000);
}

// stop marker timout
function stopTimeout() {
    clearTimeout(temporaryMarkerTimeout);
}

// draw temporaryMarkerInfobox 
function drawTemporaryMarkerInfobox(latLng) {
    customTxt = "<div><pre style=\"font-family: 'Open Sans Condensed'; sans-serif; font-size: 18px;\">"
     + formatCoordinate(latLng.lat(), "lat") + " "
     + formatCoordinate(latLng.lng(), "long") + "</pre></div>";
    return new TxtOverlay(latLng, customTxt, "coordinate_info_box", map, -110, -85);
}

// draw fixedMarkerInfobox 
function drawFixedMarkerInfobox(latLng, counter) {

    customTxt = "<div><pre style=\"font-family: 'Open Sans Condensed'; sans-serif; font-size: 18px;\">"
     + "Markierung " + (counter) + "</pre></div>";
    return new TxtOverlay(latLng, customTxt, "coordinate_info_box", map, 30, -50);
}

function getMarkerWithInfobox(event) {

    for (var i = 0; i < fixedMarkerArray.length; i++) {
        if (fixedMarkerArray[i].reference.position == event.latLng) {
            return fixedMarkerArray[i];
        }
    }
}

function getRouteMarker(event) {

    for (var i = 0; i < routeMarkerArray.length; i++) {
        if (routeMarkerArray[i].position == event.latLng) {
            return routeMarkerArray[i];
        }
    }
}

function MarkerWithInfobox(marker, infobox, counter) {
    this.reference = marker;
    this.infobox = infobox;
    this.counter = counter;
}

function setRouteMarker(position, index) {

    var path = route.getPath();

    // set start marker at current position
    var marker = new google.maps.Marker({
        position: position,
        map: map,
        icon: routeMarkerImage,
        draggable: true
    });

    marker.setMap(map);

    if (index == null) {
        path.push(position);
        routeMarkerArray.push(marker);
    } else {
        if (index == routeMarkerArray.length) {
            index--;
        }

        var coords1, coords2;
        if (routeMarkerArray.length > 1) {
            coords1 = routeMarkerArray[index - 1].getPosition();
        } else {
            coords1 = routeMarkerArray[index].getPosition();
        }
        coords2 = routeMarkerArray[index].getPosition();

        var newPosition = new google.maps.LatLng((coords1.lat() + coords2.lat()) / 2, (coords1.lng() + coords2.lng()) / 2)
        path.insertAt(index, newPosition);
        marker.setPosition(newPosition);
        routeMarkerArray.splice(index, 0, marker);
    }


    google.maps.event.addListener(marker, 'click', function (event) {
        selectedMarker = getRouteMarker(event);
        $('#routeContextMenu').contextMenu({ x: event.Ka.pageX, y: event.Ka.pageY });
    });

    google.maps.event.addListener(marker, 'dragstart', function (event) {
        selectedMarker = getRouteMarker(event);
        var path = route.getPath();
        path.forEach(function (item, index) {
            if (path.getAt(index) == selectedMarker.position) {
                markerIndex = index;
            }
        });
    });

    google.maps.event.addListener(marker, 'drag', function (event) {
        selectedMarker = getRouteMarker(event);
        var path = route.getPath();
        path.removeAt(markerIndex);
        path.insertAt(markerIndex, selectedMarker.position);
    });
}

function setTemporaryMarker(position) {

    var temporaryMarkerOptions = {
        position: position,
        map: map,
        icon: temporaryMarkerImage,
        draggable: true
    }

    // delete temp marker & infobox
    if (temporaryMarker != null) { temporaryMarker.setMap(null); }
    if (temporaryMarkerInfobox != null) { temporaryMarkerInfobox.setMap(null); }

    stopTimeout();
    temporaryMarker = new google.maps.Marker(temporaryMarkerOptions);

    // click on marker
    google.maps.event.addListener(temporaryMarker, 'click', function (event) {
        $('#temporaryMarkerContextMenu').contextMenu({ x: event.Ka.pageX, y: event.Ka.pageY });
        stopTimeout();
    });

    // marker is dragged
    google.maps.event.addListener(temporaryMarker, 'drag', function (event) {
        temporaryMarkerInfobox.setMap(null);
        temporaryMarkerInfobox = drawTemporaryMarkerInfobox(event.latLng);
    });

    // marker drag start
    google.maps.event.addListener(temporaryMarker, 'dragstart', function (event) {
        stopTimeout();
    });

    // marker drag end
    google.maps.event.addListener(temporaryMarker, 'dragend', function (event) {
        startTimeout();
    });

    startTimeout();
    temporaryMarkerInfobox = drawTemporaryMarkerInfobox(position);
}

function setFixedMarker(position) {

    temporaryMarker.setMap(null);
    temporaryMarkerInfobox.setMap(null);
    stopTimeout();

    fixedMarkerCount++;
    var fixedMarkerOptions = {
        position: position,
        map: map,
        title: 'Markierung ' + fixedMarkerCount,
        icon: fixedMarkerImage,
        draggable: true
    }

    fixedMarker = new google.maps.Marker(fixedMarkerOptions);

    // click on fixed marker
    google.maps.event.addListener(fixedMarker, 'click', function (event) {
        selectedMarker = getMarkerWithInfobox(event);
        $('#fixedMarkerContextMenu').contextMenu({ x: event.Ka.pageX, y: event.Ka.pageY });
    });

    // marker is dragged
    google.maps.event.addListener(fixedMarker, 'drag', function (event) {
        selectedMarker = getMarkerWithInfobox(event);
        selectedMarker.infobox.setMap(null);
        selectedMarker.infobox = drawFixedMarkerInfobox(event.latLng, selectedMarker.counter);
    });

    fixedMarker.setMap(map);

    fixedMarkerInfoBox = drawFixedMarkerInfobox(temporaryMarker.position, fixedMarkerCount);
    fixedMarkerArray.push(new MarkerWithInfobox(fixedMarker, fixedMarkerInfoBox, fixedMarkerCount));
}

function startNewRoute(position) {

    currentMode = MODE.ROUTE;
    deleteRoute();
    document.getElementById('routeMenuContainer').style.display = "block";

    // delete temp marker & infobox
    if (temporaryMarker != null) { temporaryMarker.setMap(null); }
    if (temporaryMarkerInfobox != null) { temporaryMarkerInfobox.setMap(null); }

    // define route options
    var routeOptions = {
        strokeOpacity: 1.0,
        strokeWeight: 2
    }

    // initialize new route
    route = new google.maps.Polyline(routeOptions);
    route.setMap(map);

    setRouteMarker(position);
}

function stopRouteMode() {
    currentMode = MODE.DEFAULT;
    document.getElementById('routeMenuContainer').style.display = "none";
}

function deleteRoute() {
    if (route != null) {
        route.setMap(null);
    }
    route = null;
    for (var i = routeMarkerArray.length; i > 0; i--) {
        routeMarkerArray[i - 1].setMap(null);
    }
    routeMarkerArray = new Array();
}