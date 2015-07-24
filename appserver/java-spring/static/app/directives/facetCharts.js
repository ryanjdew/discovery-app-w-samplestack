define([
  'app/module'
], function(module) {
  module.directive('facetCharts', ['$q', 'HighchartsHelper', 'MLRest', 'MLSearchFactory', function($q, HighchartsHelper, MLRest, searchFactory) {
    'use strict';

    function link(scope, element, attrs) {
        scope.options = scope.options || 'all';
        scope.mlSearch = scope.mlSearch || searchFactory.newContext();
        var loadData = function() {
          if (scope.charts && scope.charts.length) {
            scope.populatedConfigs = [];
            var chartsLength = scope.charts.length;
            angular.forEach(scope.charts, function(chart, index) {
              var populatedConfig = HighchartsHelper.chartFromConfig(chart, scope.mlSearch, scope.callback);
              scope.populatedConfigs.push(populatedConfig);
            });
          }
        };
        var reload = function() {
            loadData();
          };

        scope.$watch(
          function() {
            return scope.charts ? scope.charts.length : -1;
          },
          reload
        );
      }
      // directive factory creates a link function
    return {
      restrict: 'E',
      templateUrl: '/app/directives/facetCharts.html',
      scope: {
        'removeChart': '=',
        'mlSearch': '=',
        'searchOptions': '=',
        'charts': '=',
        'callback': '&'
      },
      link: link
    };
  }]);
});
