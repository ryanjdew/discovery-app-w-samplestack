define([
  'app/module'
], function (module) {
  module.directive('daLoader', ['$rootScope',function($rootScope) {
    'use strict';
    function link($scope, element, attrs) {
      $scope.$on("da_loader_show", function () {
          return element.show();
      });
      return $scope.$on("da_loader_hide", function () {
          return element.hide();
      });
    };
    // directive factory creates a link function
    return {
      restrict: 'A',
      link: link
    };
  }]);
});
