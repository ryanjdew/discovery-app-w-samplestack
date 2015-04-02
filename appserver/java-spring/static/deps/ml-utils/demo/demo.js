var demoApp = angular.module('demoApp',['ml.utils','hljs']);

demoApp.controller('DemoCtrl', [ 'mlMaps', '$scope', function(mlMaps,$scope) {
  var demoControl = this;
  demoControl.maps = {}; // store map names that we know
  demoControl.nextMap = { inclCtrl: true };
  demoControl.hideMaps = false;
  demoControl.hasOtherMaps = false;
  demoControl.kml = { url: 'http://web-apprentice-demo.craic.com/assets/maps/fremont.kml' };
  demoControl.layers = {
    map: 'main',
    traffic: false,
    transit: false
  }

  $scope.$watchCollection('demoControl.layers',function(newVal,oldVal) {
    console.log('layers object changed',newVal);
    var map = newVal.map || 'main';
    if (newVal) {
      if (demoControl.layers.traffic) {
        mlMaps.showTraffic(map);
      } else {
        mlMaps.hideTraffic(map);
      }
      if (demoControl.layers.transit) {
        mlMaps.showTransit(map);
      } else {
        mlMaps.hideTransit(map);
      }
    }
  });

  this.toggleTransit = function(mapName,flag) {
    console.log('toggleTransit',mapName,flag);
    if (flag) {
      mlMaps.showTransit(mapName);
    } else {
      mlMaps.hideTransit(mapName);
    }
  }

  this.toggleTraffic = function(mapName,flag) {
    console.log('toggleTraffi',mapName,flag);
    if (flag) {
      mlMaps.showTraffic(mapName);
    } else {
      mlMaps.hideTraffic(mapName);
    }
  }

  this.addMarker = function() {
    if (!demoControl.marker.coords) {
      alert("Please enter coordinates");
    }
    var coords = demoControl.marker.coords.split(',');
    coords[0] = parseFloat(coords[0]);
    coords[1] = parseFloat(coords[1]);
    console.log('coords',coords);
    console.log('adding marker to',demoControl.marker.mapname,'at',coords);
    mlMaps.addMarker(coords,demoControl.marker.mapname||"main");
  }


  this.addMap = function() {
    if (!demoControl.nextMap.name) {
      alert('Please give your map a name');
      return;
    }
    if (demoControl.nextMap.name === 'main' || demoControl.maps.hasOwnProperty(demoControl.nextMap.name)) {
      alert('A map by that name already exists');
      demoControl.nextMap.name = '';
      return;
    }
    demoControl.hasOtherMaps = true;
    console.log('adding map',demoControl.nextMap.name);
    demoControl.maps[demoControl.nextMap.name] = { controls: demoControl.nextMap.inclCtrl ? 'on' : 'off' }
    demoControl.nextMap.name = '';
  }

  demoControl.addKml = function() {
    console.log('addKml()');
    if (!demoControl.kml.url) {
      alert('Please enter a URL for the KML data');
      return;
    }
    console.log('calling loadKML', demoControl.kml.mapname, demoControl.kml.url);
    mlMaps.loadKML(demoControl.kml.mapname || 'main',demoControl.kml.url);
  }
}]);

angular.bootstrap(document,['demoApp']);