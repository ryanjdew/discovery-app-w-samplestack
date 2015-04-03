define(['app/module'], function (module) {
  'use strict';
  module
    .factory('HighchartsHelper', [function() {
      var highchartsHelper = {};
      highchartsHelper.seriesData = function(facet, chartType) {
        var seriesData;
        if (chartType === 'pie') {
          seriesData = [{
            type: chartType,
            name: facet.name,
            data: 
              _.map(facet.facetValues, function(val) {
                return [ val.name, val.count ];
              })
          }];
        } else {
          seriesData = _.map(facet.facetValues, function(val) {
            return {
              name: val.name,
              data: [val.count]
            };
          });
        }
        return seriesData;
      };

      highchartsHelper.chartFromConfig = function(highchartConfig, facet) {
        var chartType = highchartConfig.options.chart.type;
        var chart = angular.copy(highchartConfig);
        if (facet) {
          chart.series =  highchartsHelper.seriesData(facet, chartType);
        }
        return chart;
      };

      highchartsHelper.chartTypes = function() {
        return [
          'line',
          'spline',
          'area',
          'areaspline',
          'column',
          'bar',
          'pie' ,
          'scatter'
        ];
      };

      return highchartsHelper;
    }]);
});
