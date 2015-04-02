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
    '$scope', 'appRouting', 'appInitialized',
    function ($scope, appRouting, appInitialized) {
      $scope.setup = function () {
        appRouting.go('root.layout.setup');
      };
    }

  ]);
});
