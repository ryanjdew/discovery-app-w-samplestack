define(['app/module'], function (module) {

  /**
   * @ngdoc state
   * @name _layout
   * @requires appRouting
   *
   * @description
   * TBD
   *
   */

  module.controller('layoutCtlr', [
    '$scope', 'appRouting', 'appInitialized', 'ServerConfig',
    function ($scope, appRouting, appInitialized, serverConfig) {
      $scope.model = {};
      serverConfig.getUiConfig().then(function (uiConfig){
        $scope.model = uiConfig;
      })
      
      $scope.$on('uiConfigChanged', function(event, uiConfig){
        $scope.model = uiConfig; 
      })
      
      $scope.setup = function () {
        appRouting.go('root.layout.setup');
      };
    }

  ]);
});
