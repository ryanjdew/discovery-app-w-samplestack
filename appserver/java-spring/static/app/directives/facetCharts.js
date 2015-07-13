define([
  'app/module'
], function(module) {
  module.directive('facetCharts', ['$q', 'HighchartsHelper', 'MLRest', 'MLSearchFactory', function($q, HighchartsHelper, MLRest, searchFactory) {
    'use strict';

    function retrieveValues(mlSearch, constraints, facetNames, limit) {
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
    }

    function link(scope, element, attrs) {
        scope.options = scope.options || 'all';
        scope.mlSearch = scope.mlSearch || searchFactory.newContext();
        var loadData = function(constraints) {
          if (scope.charts && scope.charts.length) {
            scope.populatedConfigs = [];
            var chartsLength = scope.charts.length;
            angular.forEach(scope.charts, function(chart, index) {
              retrieveValues(scope.mlSearch, constraints, chart.facets, chart.valuesLimit).then(function(values) {
                if (values) {
                  var populatedConfig = HighchartsHelper.chartFromConfig(chart, values, scope.callback);
                  scope.populatedConfigs.push(populatedConfig);
                }
              });
            });
          }
        };
        scope.mlSearch.getStoredOptions(scope.options).then(function(data) {
          if (data.options) {
            scope.availableConstraints = [];
            angular.forEach(data.options.constraint, function(con) {
              var value = con.range || con.collection;
              if (value && value.facet) {
                scope.availableConstraints.push(con);
              }
            });
          }
          loadData(scope.availableConstraints);
        });
        var reload = function() {
            loadData(scope.availableConstraints);
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
