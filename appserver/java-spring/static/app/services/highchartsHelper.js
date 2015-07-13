define(['app/module'], function(module) {
  'use strict';
  module
    .factory('HighchartsHelper', ['MLRest', function(MLRest) {
      var highchartsHelper = {};
      highchartsHelper.seriesData = function(facets, chartType, categories) {
        var seriesData = [];
        var facetKeys = Object.keys(facets);
        if (facetKeys.length > 1 || chartType === 'pie') {
          seriesData = _.map(facets, function(facet) {
            return {
              type: chartType,
              name: facet.name,
              data: _.map(facet.facetValues, function(val, index) {
                if (val) {
                  return [
                    val.name,
                    val.count
                  ];
                } else {
                  return [
                    (categories) ? categories[index] : null,
                    0
                  ];
                }
              })
            };
          });
        } else if (facetKeys.length) {
          var firstKey = facetKeys[0];
          seriesData = _.map(facets[firstKey].facetValues, function(val) {
            return {
              type: chartType,
              name: val.name,
              data: [val.count]
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
            highchartsHelper.getChartData(mlSearch, availableConstraints, highchartConfig.facets, highchartConfig.facetLimit).then(function(values) {
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

      highchartsHelper.getChartData = function(mlSearch, constraints, facetNames, limit) {
        if (constraints && constraints.length) {
          var filteredConstraints = _.filter(constraints, function(constraint) {
            return constraint && facetNames.indexOf(constraint.name) > -1 && constraint.range;
          }).sort(function(a, b) {
            return facetNames.indexOf(a.name) - facetNames.indexOf(b.name);
          });
          filteredConstraints = _.map(filteredConstraints, function(constraint) {
            return constraint.range;
          });
          var tuples = [{
            'name': 'cooccurrence',
            'range': filteredConstraints,
            'values-option': ['frequency-order', 'limit=' + ((limit) ? limit : '20')]
          }];
          var constaintOptions = {
            'search': {
              'options': {
                'constraint': constraints
              },
              'query': (mlSearch) ? mlSearch.getQuery().query : null
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
              var data = {};
              var valueIndexes = {};
              if (response.data['values-response']) {
                var values;
                if (filteredConstraints.length > 1) {
                  angular.forEach(response.data['values-response'].tuple, function(tup) {
                    var valueGroupName = tup['distinct-value'][1]._value;
                    var valueGroup = data[valueGroupName];
                    if (!valueGroup) {
                      valueGroup = {
                        name: valueGroupName,
                        facetValues: []
                      };
                      data[valueGroupName] = valueGroup;
                    }
                    var valueName = tup['distinct-value'][0]._value;
                    var valueIndex = valueIndexes[valueName];
                    if (valueIndex === undefined) {
                      valueIndex = Object.keys(valueIndexes).length;
                      valueIndexes[valueName] = valueIndex;
                    }
                    valueGroup.facetValues[valueIndex] = {
                      name: valueName,
                      count: tup.frequency
                    };
                  });
                } else {
                  angular.forEach(response.data['values-response']['distinct-value'], function(valueObj) {
                    var valueGroupName = valueObj._value;
                    var valueGroup = data[valueGroupName];
                    if (!valueGroup) {
                      valueGroup = {
                        name: valueGroupName,
                        facetValues: []
                      };
                      data[valueGroupName] = valueGroup;
                    }
                    valueGroup.facetValues.push({
                      name: valueGroupName,
                      count: valueObj.frequency
                    });
                  });
                }
              }
              return {
                data: data,
                categories: Object.keys(valueIndexes)
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
