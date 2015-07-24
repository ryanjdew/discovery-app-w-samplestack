define(['app/module'], function(module) {
  'use strict';
  module
    .factory('HighchartsHelper', ['MLRest', function(MLRest) {
      var highchartsHelper = {};
      highchartsHelper.seriesData = function(data, chartType, categories) {
        var seriesData = [];
        if (categories.length) {
          seriesData = _.map(data, function(dp) {
            var sData = [];
            var dpCategoryIndex = categories.indexOf(dp.xCategory);
            angular.forEach(categories, function(cat, index){
              if (index === dpCategoryIndex) {
                sData[index] = [cat, dp.y];
              } else {
                sData[index] = [cat, 0];
              }
            });
            return {
              type: chartType,
              name: dp.x,
              data: sData
            };
          });
        } else if (chartType === 'pie') {
          seriesData = [{
            type: chartType,
            data: data
          }];
        } else {
          seriesData = _.map(data, function(dp){
            return {
              type: chartType,
              name: dp.x,
              data: [dp.y]
            };
          });
        }
        return seriesData;
      };

      highchartsHelper.chartFromConfig = function(highchartConfig, mlSearch, callback) {
        var chartType = highchartConfig.options.chart.type;
        var chart = angular.copy(highchartConfig);
        mlSearch.getStoredOptions('all').then(function(data) {
          if (data.options && data.options.constraint) {
            var availableConstraints = _.filter(data.options.constraint, function(con) {
              var value = con.range || con.collection;
              return (value && value.facet);
            });
            highchartsHelper.getChartData(mlSearch, availableConstraints, highchartConfig, highchartConfig.facetLimit).then(function(values) {
              chart.series = highchartsHelper.seriesData(values.data, chartType, values.categories);
              if (values.categories && values.categories.length) {
                chart.xAxis.categories = values.categories;
              }
            });
          }
        });
        if (callback) {
          chart.options.plotOptions = {
            series: {
              cursor: 'pointer',
              point: {
                events: {
                  click: function() {
                    var value = this.name || this.series.name;
                    if (values.data.length == 1) {
                      callback({
                        facet: values.data[0].__key,
                        value: value
                      });
                    } else {
                      callback({
                        facet: this.series.name,
                        value: value
                      });
                    }
                  }
                }
              }
            }
          };
        }
        return chart;
      };

      highchartsHelper.getChartData = function(mlSearch, constraints, highchartConfig, limit) {
        var facetNames = [highchartConfig.xAxisCategoriesMapping[0],highchartConfig.xAxisMapping[0], highchartConfig.yAxisMapping[0]];
        var dataConfig = {
          xCategoryAxis: highchartConfig.xAxisCategoriesMapping[0],
          xAxis: highchartConfig.xAxisMapping[0],
          yAxis: highchartConfig.yAxisMapping[0]
        };

        var valueIndexes = [];

        if (highchartConfig.xAxisCategoriesMapping[0] === '$frequency') {
          dataConfig.frequecy = 'xCategory';
        } else if (highchartConfig.xAxisMapping[0] === '$frequency') {
          dataConfig.frequecy = 'x';
        } else if (highchartConfig.yAxisMapping[0] === '$frequency') {
          dataConfig.frequecy = 'y';
        }

        if (constraints && constraints.length) {
          var filteredConstraints = _.filter(constraints, function(constraint) {
            return constraint && constraint.name && facetNames.indexOf(constraint.name) > -1 && constraint.range;
          }).sort(function(a, b) {
            return facetNames.indexOf(a.name) - facetNames.indexOf(b.name);
          });
          var filteredConstraintRanges = _.map(filteredConstraints, function(constraint) {
            return constraint.range;
          });
          var filteredConstraintNames = _.map(filteredConstraints, function(constraint) {
            return constraint.name;
          });
          dataConfig.xCategoryAxisIndex = filteredConstraintNames.indexOf(dataConfig.xCategoryAxis);
          dataConfig.xAxisIndex = filteredConstraintNames.indexOf(dataConfig.xAxis);
          dataConfig.yAxisIndex = filteredConstraintNames.indexOf(dataConfig.yAxis);
          var tuples = [{
            'name': 'cooccurrence',
            'range': filteredConstraintRanges,
            'values-option': ['frequency-order', 'limit=' + ((limit) ? limit : '20')]
          }];
          var constaintOptions = {
            'search': {
              'options': {
                'constraint': constraints
              },
              'query': (mlSearch) ? mlSearch.getQuery().query : {'queries': []}
            }
          };
          if (filteredConstraints.length > 1) {
            constaintOptions.search.options.tuples = tuples;
          } else {
            constaintOptions.search.options.values = tuples;
          }
          return MLRest.values('cooccurrence', {
            format: 'json'
          }, constaintOptions).then(
            function(response) {
              var data = [];
              if (response.data['values-response']) {
                var values;
                if (filteredConstraints.length > 1) {
                  angular.forEach(response.data['values-response'].tuple, function(tup) {
                    var vals = tup['distinct-value'];
                    var dataPoint = {
                      xCategory: vals[dataConfig.xCategoryAxisIndex] ? vals[dataConfig.xCategoryAxisIndex]._value : null,
                      x: vals[dataConfig.xAxisIndex] ? vals[dataConfig.xAxisIndex]._value : null,
                      y: vals[dataConfig.yAxisIndex] ? vals[dataConfig.yAxisIndex]._value : null
                    };
                    if (dataPoint.xCategory && valueIndexes.indexOf(dataPoint.xCategory) < 0) {
                      valueIndexes.push(dataPoint.xCategory);
                    }
                    dataPoint.name = dataPoint.xCategory || dataPoint.x || dataPoint.y;
                    dataPoint[dataConfig.frequecy] = tup.frequency;
                    data.push(dataPoint);
                  });
                } else {
                  angular.forEach(response.data['values-response']['distinct-value'], function(valueObj) {
                    var dataPoint = {
                      x: dataConfig.xAxisIndex > -1 ? valueObj._value : null,
                      y: dataConfig.yAxisIndex > -1 ? valueObj._value : null
                    };
                    dataPoint.name = dataPoint.x || dataPoint.y;
                    dataPoint[dataConfig.frequecy] = valueObj.frequency;
                    data.push(dataPoint);
                  });
                }
              }
              return {
                data: data,
                categories: valueIndexes
              };
            });
        } else {
          var d = $q.defer();
          d.resolve(null);
          return d.promise;
        }
      };

      highchartsHelper.chartTypes = function() {
        return [
          'line',
          'spline',
          'area',
          'areaspline',
          'column',
          'bar',
          'pie',
          'scatter'
        ];
      };

      return highchartsHelper;
    }]);
});
