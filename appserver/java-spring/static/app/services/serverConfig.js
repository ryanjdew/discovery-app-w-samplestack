define(['app/module'], function (module) {
  'use strict';
  module
    .factory('ServerConfig', ['$http', '$q', function($http, $q) {
      var serverConfig = {};
      serverConfig.get = function() {
        var config = {},
            defered = [$q.defer(),$q.defer(),$q.defer()],
            promises = _.map(defered, function(d) { return d.promise; }),
            configItems = {
              searchOptions: 'getSearchOptions',
              fields: 'getFields',
              rangeIndexes: 'getRangeIndexes'
            },
            defaults = {
              searchOptions: {option: {constraint: []}},
              fields: {fieldList: []},
              rangeIndexes: {tangeindexList: []}
            };
        var recursiveRun = function(keys, index) {
          if (index < keys.length) {
            var d = defered[index],
              key = keys[index],
              value = configItems[key];
            serverConfig[value]().then(function(result) {
              config[key] = result || defaults[key];
              recursiveRun(keys, index + 1);
              d.resolve(result);
            }, d.reject);
          }
        };

        recursiveRun(Object.keys(configItems), 0);

        return $q.all(promises).then(function() { return config; });
      };

      serverConfig.getFields = function() {
        return $http.get('/server/database/fields')
          .then(function(response){
            return response.data;
          });
      };

      serverConfig.setFields = function(rangeIndexes) {
        return $http.put('/server/database/fields', rangeIndexes)
          .then(function(response){
            return response.data;
          });
      };

      serverConfig.getRangeIndexes = function() {
        return $http.get('/server/database/range-indexes')
          .then(function(response){
            return response.data;
          });
      };

      serverConfig.setRangeIndexes = function(rangeIndexes) {
        return $http.put('/server/database/range-indexes', rangeIndexes)
          .then(function(response){
            return response.data;
          });
      };

      serverConfig.getSearchOptions = function() {
        return $http.get('/server/search-options')
          .then(function(response){
            return response.data;
          });
      };

      serverConfig.setSearchOptions = function(searchOptions) {
        return $http.put('/server/search-options', searchOptions)
          .then(function(response){
            return response.data;
          });
      };

      serverConfig.find = function(localname, type) {
        return $http.get('/server/database/content-metadata', {params: {localname: localname, type:type}})
          .then(function(response){
            return response.data;
          });
      };

      serverConfig.loadData = function(directory) {
        return $http.get('/server/database/load-data', {params: {directory: directory}})
          .then(function(response){
            return response.data;
          });
      };

      serverConfig.dataTypes = function() {
        return [
          'int',
          'unsignedInt',
          'long',
          'unsignedLong',
          'float',
          'double',
          'decimal' ,
          'dateTime',
          'time',
          'date',
          'gYearMonth',
          'gYear',
          'gMonth',
          'gDay',
          'yearMonthDuration',
          'dayTimeDuration',
          'string',
          'anyURI'
        ];
      };

      return serverConfig;
    }]);
});
