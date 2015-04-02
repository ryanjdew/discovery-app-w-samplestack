(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = function(app) {

  // capitalize first letter of a string
  app.filter('capitalize', function() {
    return function(input) {
      if (input) {
        input = input[0].toUpperCase() + input.substr(1);
      }
      return input;
    }
  });

}
},{}],2:[function(require,module,exports){
var app = angular.module('ml.utils',[]);

require('./maps.js')(app);
require('./loader.js')(app);
require('./filters.js')(app);

exports.module = app;
},{"./filters.js":1,"./loader.js":3,"./maps.js":4}],3:[function(require,module,exports){
module.exports = function(app) {

  app
  .provider('scriptLoader', function() {
    // configurable options
    var timeout = 10000;

    this.setTimeout = function(duration) {
      timeout = duration;
    };

    this.$get = ['$q', function($q) {
      var service = {}, win = window, doc = win.document, bod = document.body;

      service.loadScript = function(url) {
        console.log('loading '+url);
        var deferred = $q.defer();
        var scr = doc.createElement('script');
        var done = false;
        scr.type = 'text/javascript';
        scr.src = url;
        var to = win.setTimeout(function() {
          // reject if we aren't done
          if (!done) {
            deferred.reject();
          }
        },timeout);

        // setup our load function
        scr.onload = scr.onreadystatechange = function() {
          if (!done && (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete')) {
            // we are done
            deferred.resolve();
            done = true;
            // clean it up
            scr.onload = scr.onreadystatechange = null;
            if (scr.parentNode) {
              scr.parentNode.removeChild(scr);
            }
            // clear the timeout for good measure
            win.clearTimeout(to);
          }
        }

        bod.appendChild(scr);

        return deferred.promise;
      };

      return service;

    }];

  });
};
},{}],4:[function(require,module,exports){
"use strict";
module.exports = function(app) {

  app
    .provider('mlMaps', function() {
      // configurable options
      var apiKey, clientId, v, sensor, cb = 'mlMapsLoaded', libraries = [], scriptUrl = 'https://maps.googleapis.com/maps/api/js';
      var defaultOptions = { 
        center: [37.774546, -122.433523], 
        zoom: 8,
        controlType: 'HORIZONTAL_BAR', // like google maps
        zoomControl: 'LARGE',
        disbleDefaultUI: true
      };

      // exposed config fuctions for .config() block
      this.setApiKey = function(key) {
        apiKey = key;
      };
      this.setClientId = function(id) {
        clientId = id;
      };
      this.useSensor = function(flag) {
        sensor = flag;
      };
      this.setScriptUrl = function(url) {
        scriptUrl = url;
      };
      this.useLibraries = function(libs) {
        libraries = libs;
      };
      this.addLibrary = function(lib) {
        libraries.push(lib);
      }
      // since google maps is not loaded yet, any lat/lng must be arrays instead of google map objects
      this.setDefaultOptions = function(options) {
        defaultOptions = options;
      };
      // sets the default value for center, may still be overridden with createMap
      this.defaultCenter = function(lat,lng) {
        defaultOptions.center = [lat,lng];
      };
      this.defaultZoom = function(z) {
        defaultOptions.zoom = z;
      };
      this.useVersion = function(vnum) {
        v = vnum;
      };

      var createScriptUrl = function() {
        var url = scriptUrl + '?callback=mlMapsLoaded';
        if (apiKey) {
          url += '&key=' + apiKey;
        }
        if (v) {
          url += '&v=' + v;
        }
        url += '&sensor=' + (sensor ? 'true':'false');
        if (clientId) {
          url += '&clientId='+clientId;
        }
        if (libraries.length) {
          url += '&libraries='+libraries.join(',');
        }
        return url;
      };

      this.$get = ['scriptLoader', '$q', function(scriptLoader,$q) {
        var loader = $q.defer(), load = function() { return loader.promise; }, maps = {}, service = {};
        // google maps does its own magic, so we need to listen for their callback not just wait for the script to be loaded
        window.mlMapsLoaded = function() {
          service.loaded = true;
          loader.resolve();
        }
        //inject the googlemaps api if necessary
        if (window.google && window.google.maps) {
          load.resolve();
        } else {
          console.log('injecting the googlemaps api');
          scriptLoader.loadScript(createScriptUrl());
        }

        // primarily used internally but exposed just in case someone wants to use it
        service.resolveMapOrMapName = function(mapOrMapName) {
          if (typeof mapOrMapName === 'string') {
            var mapObj = maps[mapOrMapName];
            if (mapObj) {
              return mapObj.map;
            }
          } else {
            return mapOrMapName; // it's a map (well we assume it is if it's not a string)
          }
        }

        // callers need to make sure this is called only after a map has been loaded
        service.addMarker = function(position,mapOrMapName) {
          var map = service.resolveMapOrMapName(mapOrMapName);
          var thisLatLng = new google.maps.LatLng(position[0],position[1]);
          return new google.maps.Marker({
            position: thisLatLng,
            map: map
          })
        };

        // create a new map
        service.createMap = function(name,ele,options) {
          name = name || 'default';
          console.log('creating map '+name);
          var mapOptions = {};
          angular.extend(mapOptions,defaultOptions,options||{});
          //console.log(mapOptions);

          // we need to make sure the script has been loaded
          return load().then(function() {
            console.log('maps initialized');
            // now that it's loaded we can convert things to google maps API objects
            mapOptions.center = new google.maps.LatLng(mapOptions.center[0],mapOptions.center[1]);
            if(mapOptions.controlType) {
              mapOptions.mapTypeControl = true;
              mapOptions.mapTypeControlOptions = {
                style: google.maps.MapTypeControlStyle[mapOptions.controlType],
                position: google.maps.ControlPosition.BOTTOM_CENTER
              }
            }
            if (mapOptions.panControl) {

            } else {
              mapOptions.panControl = false;
            }
            if (mapOptions.zoomControl) {
              mapOptions.zoomControlOptions = {
                style: google.maps.ZoomControlStyle[mapOptions.zoomControl],
                position: google.maps.ControlPosition.RIGHT_BOTTOM 
              }
              mapOptions.zoomControl = true;              
            }
            // create an object that will house other things like layers, markers, etc
            maps[name] = {
              name: name,
              map: new google.maps.Map(ele,mapOptions)
            };
            console.log(maps[name].map)
            maps[name].map._objMapName = name; // store our name on the map itself so we don't lose the connection
            return maps[name];
          });
        };

        service.showTraffic = function(mapName) { // potentially: support mapOrMapName here, for now just mapName
          var mapObj = maps[mapName];
          if (mapObj) {
            if (!mapObj.trafficLayer) {
              mapObj.trafficLayer = new google.maps.TrafficLayer();
            }
            mapObj.trafficLayer.setMap(mapObj.map);
          }
        }
        service.hideTraffic = function(mapName) { // potentially: support mapOrMapName here, for now just mapName
          var mapObj = maps[mapName];
          if (mapObj && mapObj.trafficLayer) {
            mapObj.trafficLayer.setMap();
          }
        }

        service.showTransit = function(mapName) { // potentially: support mapOrMapName here, for now just mapName
          var mapObj = maps[mapName];
          if (mapObj) {
            if (!mapObj.transitLayer) {
              mapObj.transitLayer = new google.maps.TransitLayer();
            }
            mapObj.transitLayer.setMap(mapObj.map);
          }
        }
        service.hideTransit = function(mapName) { // potentially: support mapOrMapName here, for now just mapName
          var mapObj = maps[mapName];
          if (mapObj && mapObj.trafficLayer) {
            mapObj.transitLayer.setMap();
          }
        }

        service.addHeatmap = function(mapName,heatMapData) {
          console.log('adding heat map');
          var mapObj = maps[mapName];
          if (mapObj) {
            if (!mapObj.heatmaps) {
              mapObj.heatmaps = [];
            }
            var heatmap = new google.maps.visualization.HeatmapLayer({
              data: heatMapData
            });
            heatmap.setMap(mapObj.map);
            mapObj.heatmaps.push(heatmap);
          }
        };

        service.hideHeatmaps = function(mapName) {
          var mapObj = maps[mapName];
          if (mapObj && mapObj.heatmaps) {
            var hm = mapObj.heatmaps.pop();
            while(hm) {
              hm.setMap();
              hm = mapObj.heatmaps.pop();
            }
          }
        }
        service.showHeatmaps = function(mapName) {
          var mapObj = maps[mapName];
          if (mapObj && mapObj.heatmaps) {
            var hm = mapObj.heatmaps.pop();
            while(hm) {
              hm.setMap(mapObj.map);
              hm = mapObj.heatmaps.pop();
            }
          }
        }
        service.loadKML = function(mapName,url) { // KML or GeoRSS URL - supports multiple
          var mapObj = maps[mapName];
          if (mapObj) {
            if (!mapObj.kmlayers) {
              mapObj.kmlayers = [];
            }
            console.log('adding kml to '+mapName+': '+url);
            var kmlayer = new google.maps.KmlLayer({url: url});
            kmlayer.setMap(mapObj.map);
            mapObj.kmlayers.push(kmlayer);
            return kmlayer;
          }
        }
        service.loadGeoJson = function(mapName,url) { // GeoJSON - only allows a single data layer
          var mapObj = maps[mapName];
          if (mapObj && mapObj.map) {
            mapObj.map.data.loadGeoJson(url);
          }
        }

        return service;

      }];

    })
    // insert a map into any DOM element <div ml-map="mapName"></div>
    .directive('mlMap', ['mlMaps', function(mlMaps) {
      return {
        restrict: 'A',
        scope: {
          mlMap: '@', // directive also contains the map name
          controls: '@', // [optional] valid: 'off', 'false', 'default', any other values equate to true
          zoom: '@', // [optional] set a numeric zoom level
          center: '=',  // [optional] the lat,lng value center of the map, expected: an array
          markerAt: '=' // [optional] the lat,lng coords of a default marker to add, expected: an array
        },
        link: function(scope,element,attributes) {
          var opts = { };
          if (scope.center || scope.markerAt) {
            opts.center = scope.center || scope.markerAt;
          }
          if (scope.zoom && !isNaN(scope.zoom)) {
            opts.zoom = parseInt(scope.zoom);
          }
          // construct the options object
          if (scope.controls === 'false' || scope.controls === 'off') {
            opts.controlType = false;
            opts.mapTypeControl = false;
            opts.streetViewControl = false;
            opts.zoomControl = false;
          } else if (scope.controls === 'default') {
            opts.controlType =false;
          }
          var mapName = scope.mlMap || 'default'
          // use the name or default if empty attribute
          var map = mlMaps.createMap(mapName,element[0], opts);
          if (scope.markerAt && scope.markerAt.length === 2) {
            // add marker after the google script has loaded
            map.then(function(map) { 
              mlMaps.addMarker(scope.markerAt,map.map);
            });
          }
        }
      }
    }]);
};
},{}]},{},[2])