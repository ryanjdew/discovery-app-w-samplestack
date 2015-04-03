define([
  'app/module'
], function (module) {
  module.directive('facetCharts', ['HighchartsHelper', function(HighchartsHelper) {
    'use strict';
    function link(scope, element, attrs) {
      var loadData = function() {
          if (scope.charts) {
            scope.populatedConfigs = [];
            var chartsLength = scope.charts.length;
            angular.forEach(scope.charts, function(chart, index) {
              var populatedConfig = HighchartsHelper.chartFromConfig(chart, scope.facets[chart.facetName]);
              scope.populatedConfigs.push(populatedConfig);
            });
          }
        };
      scope.$watch(
        function() { 
          return  scope.charts ? scope.charts.length : -1;
        },
        loadData
      );
      scope.$watchCollection(
        'facets',
        loadData
      );
    }
    // directive factory creates a link function
    return {
      restrict: 'E',
      templateUrl: '/app/directives/facetCharts.html',
      scope: {
        'facets': '=',
        'removeChart': '=',
        'charts': '='
      },
      link: link
    };
  }]);
});
