define(['app/module'], function(module) {
  'use strict';
  module
    .factory('HighchartsHelper', ['$q', 'MLQueryBuilder', 'MLRest', 'MLSearchFactory', function($q, MLQueryBuilder, MLRest, MLSearchFactory) {
      var highchartsHelper = {};
      highchartsHelper.seriesData = function(data, chartType, categories) {
        var seriesData = [];
        if (categories.length) {
          var mappedXValues = {};
          angular.forEach(data, function(dp) {
            if (!mappedXValues[dp.x]) {
              mappedXValues[dp.x] = [];
            }
            var dpCategoryIndex = categories.indexOf(dp.xCategory);
            mappedXValues[dp.x][dpCategoryIndex] = [
              dp.xCategory,
              dp.y,
              dp.z
            ];
          });
          angular.forEach(mappedXValues, function(xVal, xValKey) {
            angular.forEach(categories, function(cat, index) {
              if (!xVal[index]) {
                xVal[index] = [
                  cat,
                  0,
                  0
                ];
              }
            });
            seriesData.push({
              'type': chartType,
              'name': xValKey,
              'data': xVal
            });
          });
        } else if (chartType === 'pie') {
          seriesData = [{
            type: chartType,
            data: data
          }];
        } else if (chartType === 'bubble') {
          seriesData = _.map(data, function(dp) {
            return {
              type: chartType,
              name: dp.name,
              data: [{
                x: dp.x,
                y: dp.y,
                z: dp.z
              }]
            };
          });
        } else {
          seriesData = _.map(data, function(dp) {
            return {
              type: chartType,
              name: dp.x,
              data: [dp.y, dp.z]
            };
          });
        }
        return seriesData;
      };

      highchartsHelper.chartFromConfig = function(highchartConfig, mlSearch, callback) {
        var chartType = highchartConfig.options.chart.type;
        var chart = angular.copy(highchartConfig);
        if (!mlSearch) {
          mlSearch = MLSearchFactory.newContext();
        }
        mlSearch.getStoredOptions('all').then(function(data) {
          if (data.options && data.options.constraint) {
            var availableConstraints = _.filter(data.options.constraint, function(con) {
              var value = con.range || con.collection;
              return (value && value.facet);
            });
            highchartsHelper.getChartData(mlSearch, availableConstraints, highchartConfig, highchartConfig.resultLimit).then(function(values) {
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
                    if (value.data.length === 1) {
                      callback({
                        facet: value.data[0].__key,
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

      function getDataConfig(highchartConfig, filteredFacetNames, filteredValueNames) {
        var dataConfig = {
          xCategoryAxis: highchartConfig.xAxisCategoriesMLConstraint,
          xAxis: highchartConfig.xAxisMLConstraint,
          yAxis: highchartConfig.yAxisMLConstraint,
          zAxis: highchartConfig.zAxisMLConstraint
        };

        if (highchartConfig.xAxisCategoriesMLConstraint === '$frequency') {
          dataConfig.frequency = 'xCategory';
        } else if (highchartConfig.xAxisMLConstraint === '$frequency') {
          dataConfig.frequency = 'x';
        } else if (highchartConfig.yAxisMLConstraint === '$frequency') {
          dataConfig.frequency = 'y';
        } else if (highchartConfig.zAxisMLConstraint === '$frequency') {
          dataConfig.frequency = 'z';
        }

        dataConfig.facets = {
          xCategoryAxisIndex: filteredFacetNames.indexOf(dataConfig.xCategoryAxis),
          xAxisIndex: filteredFacetNames.indexOf(dataConfig.xAxis),
          yAxisIndex: filteredFacetNames.indexOf(dataConfig.yAxis),
          zAxisIndex: filteredFacetNames.indexOf(dataConfig.zAxis)
        };

        dataConfig.values = {
          xCategoryAxisIndex: filteredValueNames.indexOf(dataConfig.xCategoryAxis),
          xAxisIndex: filteredValueNames.indexOf(dataConfig.xAxis),
          yAxisIndex: filteredValueNames.indexOf(dataConfig.yAxis),
          zAxisIndex: filteredValueNames.indexOf(dataConfig.zAxis)
        };

        return dataConfig;
      }

      function getConstraintsOnChart(constraints, facetNames) {
        return _.filter(constraints, function(constraint) {
          return constraint && constraint.name && facetNames.indexOf(constraint.name) > -1 && constraint.range;
        }).sort(function(a, b) {
          // ensure collections are on top
          var aCollectionFactor = (!a.collection) ? 100 : 1;
          var bCollectionFactor = (!b.collection) ? 100 : 1;
          return (facetNames.indexOf(a.name) * aCollectionFactor) - (facetNames.indexOf(b.name) * bCollectionFactor);
        });
      }

      function getSearchConstraintOptions(mlSearch, constraints, filteredConstraints, limit, additionalQuery) {
        var filteredConstraintRanges = _.map(filteredConstraints, function(constraint) {
          return constraint.range;
        });
        var filteredConstraintCollections = _.map(filteredConstraints, function(constraint) {
          return constraint.collection;
        });
        var tuples = [{
          'name': 'cooccurrence',
          'collection': _.without(filteredConstraintCollections, null, undefined),
          'range': _.without(filteredConstraintRanges, null, undefined),
          'values-option': ['frequency-order', 'limit=' + ((limit) ? limit : '20')]
        }];
        var query = (mlSearch) ? angular.copy(mlSearch.getQuery().query) : { queries: []};
        query.queries.unshift.apply(query.queries, additionalQuery);
        var constraintOptions = {
          'search': {
            'options': {
              'constraint': constraints
            },
            'query': query
          }
        };
        if (filteredConstraints.length > 1) {
          constraintOptions.search.options.tuples = tuples;
        } else {
          constraintOptions.search.options.values = tuples;
        }
        return constraintOptions;
      }

      // kudos to http://stackoverflow.com/questions/4331092/finding-all-combinations-of-javascript-array-values
      function allPossibleCases(arr) {
        if (arr.length === 1) {
          return _.map(arr[0].facetValues, function(facetVal) {
            return [{
              'facetName': arr[0].name,
              'type': arr[0].type,
              '_value': facetVal.value,
              'frequecy': facetVal.frequency,
              'query': { qtext: '"' + arr[0].name + '":"' + facetVal.name + '"' }
            }];
          });
        } else {
          var result = [];
          var allCasesOfRest = allPossibleCases(arr.slice(1)); // recur with the rest of array
          for (var i = 0; i < allCasesOfRest.length; i++) {
            for (var j = 0; j < arr[0].facetValues.length; j++) {
              result.push(_.flatten([{
                  'facetName': arr[0].name,
                  'type': arr[0].type,
                  '_value': arr[0].facetValues[j].value,
                  'frequecy': arr[0].facetValues[j].frequency,
                  'query': { qtext: '"' + arr[0].name + '":"' + arr[0].facetValues[j].name + '"' }
                },
                allCasesOfRest[i]
              ]));
            }
          }
          return result;
        }
      }

      highchartsHelper.getChartData = function(mlSearch, constraints, highchartConfig, limit) {
        var facetNames = _.without([highchartConfig.xAxisCategoriesMLConstraint, highchartConfig.xAxisMLConstraint, highchartConfig.yAxisMLConstraint, highchartConfig.zAxisMLConstraint], null, undefined);

        var valueIndexes = [];
        var facetData = [];
        var facetsPromise;
        if (mlSearch.results.facets) {
          var facets = angular.copy(mlSearch.results.facets);
          angular.forEach(facets, function(val, key) {
            val.name = key;
          });
          facetsPromise = $q.when(facets);
        } else {
          facetsPromise = MLRest.search({
            options: mlSearch.options.queryOptions
          })
          .then(function(response) {
            angular.forEach(response.data.facets, function(val, key) {
              val.name = key;
            });
            return response.data.facets;
          });
        }
        return facetsPromise.then(function(facets) {
          if (constraints && constraints.length) {
            var filteredConstraints = getConstraintsOnChart(constraints, facetNames);

            var constraintsFromFacets = [];
            var constraintsFromValues = [];

            angular.forEach(filteredConstraints, function(constraint) {
              if (constraint.custom || (constraint.range && (constraint.range.bucket || constraint.range['computed-bucket']))) {
                constraintsFromFacets.push(facets[constraint.name]);
              } else {
                constraintsFromValues.push(constraint);
              }
            });

            var valueConstraintNames = _.map(constraintsFromValues, function(c) { return c.name; });
            var facetConstraintNames = _.map(constraintsFromFacets, function(c) { return c.name; });
            var dataConfig = getDataConfig(highchartConfig, facetConstraintNames, valueConstraintNames);

            var getValue = function(item) {
              return (item) ? item._value : null;
            };

            var facetCombinations;
            if (constraintsFromFacets.length > 0) {
              facetCombinations = allPossibleCases(constraintsFromFacets);
            } else {
              facetCombinations = [[{
                'query': {
                  'and-query': {
                    'queries': []
                  }
                }
              }]];
            }

            if (constraintsFromValues.length > 0) {
              var promises = [];
              angular.forEach(facetCombinations, function(facetCombination) {
                var combinationQuery = _.map(facetCombination, function(f) {
                  return f.query;
                });
                var constraintOptions = getSearchConstraintOptions(mlSearch, constraints, constraintsFromValues, limit, combinationQuery);
                promises.push(MLRest.values('cooccurrence', {
                  format: 'json'
                }, constraintOptions).then(
                  function(response) {
                    if (response.data['values-response']) {
                      if (constraintsFromValues.length > 1) {
                        angular.forEach(response.data['values-response'].tuple, function(tup) {
                          var vals = tup['distinct-value'];
                          var dataPoint = {
                            xCategory: getValue(_.without([vals[dataConfig.values.xCategoryAxisIndex], facetCombination[dataConfig.facets.xCategoryAxisIndex]], null, undefined)[0]),
                            x: getValue(_.without([vals[dataConfig.values.xAxisIndex], facetCombination[dataConfig.facets.xAxisIndex]], null, undefined)[0]),
                            y: getValue(_.without([vals[dataConfig.values.yAxisIndex], facetCombination[dataConfig.facets.yAxisIndex]], null, undefined)[0]),
                            z: getValue(_.without([vals[dataConfig.values.zAxisIndex], facetCombination[dataConfig.facets.zAxisIndex]], null, undefined)[0])
                          };
                          if (dataPoint.xCategory && valueIndexes.indexOf(dataPoint.xCategory) < 0) {
                            valueIndexes.push(dataPoint.xCategory);
                          }
                          dataPoint.name = _.without([dataPoint.xCategory, dataPoint.x, dataPoint.y, dataPoint.z], null, undefined).join();
                          dataPoint[dataConfig.frequency] = tup.frequency;
                          dataPoint.frequency = tup.frequency;
                          facetData.push(dataPoint);
                        });
                      } else {
                        angular.forEach(response.data['values-response']['distinct-value'], function(valueObj) {
                          var dataPoint = {
                            xCategory: getValue(_.without([(dataConfig.values.xCategoryAxisIndex > -1) ? valueObj : null, facetCombination[dataConfig.facets.xCategoryAxisIndex]], null, undefined)[0]),
                            x: getValue(_.without([(dataConfig.values.xAxisIndex > -1) ? valueObj : null, facetCombination[dataConfig.facets.xAxisIndex]], null, undefined)[0]),
                            y: getValue(_.without([(dataConfig.values.yAxisIndex > -1) ? valueObj : null, facetCombination[dataConfig.facets.yAxisIndex]], null, undefined)[0]),
                            z: getValue(_.without([(dataConfig.values.zAxisIndex > -1) ? valueObj : null, facetCombination[dataConfig.facets.zAxisIndex]], null, undefined)[0])
                          };
                          if (dataPoint.xCategory && valueIndexes.indexOf(dataPoint.xCategory) < 0) {
                            valueIndexes.push(dataPoint.xCategory);
                          }
                          dataPoint.name = _.without([dataPoint.xCategory, dataPoint.x, dataPoint.y, dataPoint.z], null, undefined).join();
                          dataPoint[dataConfig.frequency] = valueObj.frequency;
                          dataPoint.frequency = valueObj.frequency;
                          facetData.push(dataPoint);
                        });
                      }
                    }
                  }));
              });
              return $q.all(promises).then(function() {
                return {
                  data: facetData.sort(function(a, b) {
                    return b.frequency - a.frequency;
                  }),
                  categories: valueIndexes
                };
              });
            } else if (constraintsFromFacets.length === 1) {
              //handle by getting facets
              angular.forEach(facetCombinations, function(facetCombination) {
                var dataPoint = {
                  xCategory: getValue(_.without([facetCombination[dataConfig.facets.xCategoryAxisIndex]], null, undefined)),
                  x: getValue(_.without([facetCombination[dataConfig.facets.xAxisIndex]], null, undefined)),
                  y: getValue(_.without([facetCombination[dataConfig.facets.yAxisIndex]], null, undefined)),
                  z: getValue(_.without([facetCombination[dataConfig.facets.zAxisIndex]], null, undefined)),
                  frequency: facetCombination[0].frequency
                };
                dataPoint[dataConfig.frequency] = facetCombination[0].frequency;
                facetData.push(dataPoint);
              });
            } else {
              console.log('TODO: mulitple bucket facets without values');
            }
          }
          return {
            data: facetData.sort(function(a, b) {
              return b.frequency - a.frequency;
            }),
            categories: valueIndexes
          };
        });
      };

      highchartsHelper.chartTypes = function() {
        return [
          'line',
          'spline',
          'area',
          'areaspline',
          'column',
          'bar',
          'bubble',
          'pie',
          'scatter'
        ];
      };

      return highchartsHelper;
    }]);
});
