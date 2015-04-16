define(['app/module'], function (module) {
  'use strict';

  module
    .controller('setupCtlr', [
      '$modal', '$scope', 'ServerConfig', 
      '$window', 'MLSearchFactory', 
      'newRangeIndexDialog', 'editRangeIndexDialog', 
      'fieldDialog', 
      'newChartWidgetDialog', 
      function (
        $modal, $scope, ServerConfig, 
        win, searchFactory, 
        newRangeIndexDialog, editRangeIndexDialog, 
        fieldDialog, 
        newChartWidgetDialog
      ) {
      var model = {};
      var mlSearch = searchFactory.newContext();

      function updateSearchResults() {
        $scope.error = null;
        return mlSearch.setPageLength(5).search().then(
          function(data) {
            model.isInErrorState = false;
            model.search = data;
          },
          function() {
            model.isInErrorState = true;
          });
      }

      function handleError(response) {
        $scope.error = response.data.message || response.data;
      }

      updateSearchResults();

      ServerConfig.get().then(function(config){
        model.chartData = config.chartData;
        model.fields = config.fields;
        model.rangeIndexes = config.rangeIndexes;
        model.searchOptions = config.searchOptions;
        model.constraints = config.searchOptions.options.constraint;
      });
      angular.extend($scope, {
        model: model,
        state: 'indexes',
        loadData: function() {
          ServerConfig.loadData($scope.loadDirectory).then(function() {
            updateSearchResults().then(function() {
              $scope.state = 'appearance';
            });
          }, handleError);
        },
        removeIndex: function(indexPosition) {
          model.rangeIndexes['range-index-list'].splice(indexPosition, 1);
          ServerConfig.setRangeIndexes(model.rangeIndexes).then(updateSearchResults, handleError);
        },
        editIndex: function(index) {
          editRangeIndexDialog(index).then(function(index) {
            if (index) {
              ServerConfig.setRangeIndexes(model.rangeIndexes).then(updateSearchResults, handleError);
            }
          });
        },
        addChart: function() {
          newChartWidgetDialog(model.search.facets).then(function(chart) {
            model.chartData.charts.push(chart);
            ServerConfig.setCharts(model.chartData).then(updateSearchResults, handleError);
          });
        },
        removeChart: function(chartPosition) {
          model.chartData.charts.splice(chartPosition, 1);
          ServerConfig.setCharts(model.chartData).then(updateSearchResults, handleError);
        },
        addIndex: function() {
          newRangeIndexDialog(model.fields['field-list']).then(function(index) {
            model.rangeIndexes['range-index-list'].push(index);
            ServerConfig.setRangeIndexes(model.rangeIndexes).then(updateSearchResults, handleError);
          });
        },
        removeField: function(fieldPosition) {
          model.fields['field-list'].splice(fieldPosition, 1);
          ServerConfig.setFields(model.fields).then(updateSearchResults, handleError);
        },
        addField: function(field) {
          fieldDialog().then(function(field) {
            model.fields['field-list'].push(field);
            ServerConfig.setFields(model.fields).then(updateSearchResults, handleError);
          });
        },
        editField: function(field) {
          fieldDialog(field).then(function(field) {
            if (field) {
              ServerConfig.setFields(model.fields).then(updateSearchResults, handleError);
            }
          });
        },
        removeConstraint: function(index) {
          model.searchOptions.options.constraint.splice(index,1);
        },
        submitConstraints: function() {
          model.searchOptions.options.constraint = model.constraints;
          ServerConfig.setSearchOptions(model.searchOptions).then(function() {
            updateSearchResults().then(function() {
              $scope.state = 'appearance';
            });
          },handleError);
        },
        resampleConstraints: function() {
          model.constraints = [];
          angular.forEach(model.rangeIndexes['range-index-list'], function(val){
            var value = val['range-element-index'] || val['range-element-attribute-index'] || val['range-field-index'];
            var name = value.localname || value['field-name'];
            if (name && name !== '') {
              var constraint =
                {
                  'name': name,
                  'range':
                    {
                      'type': 'xs:'+ value['scalar-type'],
                      'facet': true,
                      'facet-option' : [
                        'limit=10',
                        'frequency-order',
                        'descending'
                      ],
                      'collation': value.collation
                  }
                };
              if (value.localname) {
                constraint.range.element = {
                    'name': (value['parent-localname'] || value.localname),
                    'ns': (value['parent-namespace-uri'] || value['namespace-uri'])
                  };
              }
              if (value['parent-localname']) {
                constraint.range.attribute = {
                    'name': value.localname,
                    'ns': value['namespace-uri']
                  };
              }
              if (value['field-name']) {
                constraint.range.field = {
                    'name': value['field-name'],
                    'collation': value.collation
                  };
              }
              model.constraints.push(constraint);
            }
          });
          angular.forEach(model.fields['field-list'], function(value){
            if (value['field-name'] && value['field-name'] !== '') {
              var constraint =
                {
                  'name': value['field-name'],
                  'word':
                    {
                      'field': {
                        'name': value['field-name'],
                        'collation': value.collation
                      }
                  }
                };
              model.constraints.push(constraint);
            }
          });
        }
      });
    }]);
});
