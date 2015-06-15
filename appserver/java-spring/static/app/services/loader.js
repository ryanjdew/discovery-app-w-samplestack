define(['app/module'], function(module) {
  'use strict';
  module
    .factory('daLoaderInterceptor', ['$q', '$rootScope', '$log', function($q, $rootScope, $log) {

      var numLoadings = 0;
      return {
        request: function(config) {

          numLoadings++;

          // Show loader
          $rootScope.$broadcast("da_loader_show");
          return config || $q.when(config)

        },
        response: function(response) {

          if ((--numLoadings) === 0) {
            // Hide loader
            $rootScope.$broadcast("da_loader_hide");
          }

          return response || $q.when(response);

        },
        responseError: function(response) {

          if (!(--numLoadings)) {
            // Hide loader
            $rootScope.$broadcast("da_loader_hide");
          }

          return $q.reject(response);
        }
      };
    }])
    .config(['$httpProvider', function ($httpProvider) {
      $httpProvider.interceptors.push('daLoaderInterceptor');
    }]);
});
