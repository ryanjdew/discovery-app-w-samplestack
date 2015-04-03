define(['app/module'], function (module) {
  'use strict';

  module
    .controller('setupCtlr', [
      '$modal', '$scope', 'ServerConfig', 
      '$window', 'MLSearchFactory', 
      'newRangeIndexDialog', 'editRangeIndexDialog', 
      'newChartWidgetDialog', 
      function (
        $modal, $scope, ServerConfig, 
        win, searchFactory, 
        newRangeIndexDialog, editRangeIndexDialog, 
        newChartWidgetDialog
      ) {
      var model = {};
      var mlSearch = searchFactory.newContext();

      function updateSearchResults() {
        return mlSearch.setPageLength(5).search().then(
          function(data) {
            model.isInErrorState = false;
            model.search = data;
          },
          function() {
            model.isInErrorState = true;
          });
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
          });
        },
        removeIndex: function(indexPosition) {
          model.rangeIndexes.rangeindexList.splice(indexPosition, 1);
          ServerConfig.setRangeIndexes(model.rangeIndexes).then(updateSearchResults);
        },
        editIndex: function(index) {
          editRangeIndexDialog(index).then(function(index) {
            if (index) {
              ServerConfig.setRangeIndexes(model.rangeIndexes).then(updateSearchResults);
            }
          });
        },
        addChart: function() {
          newChartWidgetDialog(model.search.facets).then(function(chart) {
            model.chartData.charts.push(chart);
            ServerConfig.setCharts(model.chartData).then(updateSearchResults);
          });
        },
        removeChart: function(chartPosition) {
          model.chartData.charts.splice(chartPosition, 1);
          ServerConfig.setCharts(model.chartData).then(updateSearchResults);
        },
        addIndex: function() {
          newRangeIndexDialog().then(function(index) {
            model.rangeIndexes.rangeindexList.push(index);
            ServerConfig.setRangeIndexes(model.rangeIndexes).then(updateSearchResults);
          });
        },
        removeField: function(fieldPosition) {
          model.fields.fieldList.splice(fieldPosition, 1);
          ServerConfig.setFields(model.fields).then(updateSearchResults);
        },
        addField: function(field) {
          model.fields.fieldList.push(field);
          ServerConfig.setFields(model.fields).then(updateSearchResults);
        },
        submitConstraints: function() {
          model.searchOptions.options.constraint = model.constraints;
          ServerConfig.setSearchOptions(model.searchOptions).then(function() {
            updateSearchResults().then(function() {
              $scope.state = 'appearance';
            });
          });
        },
        resampleConstraints: function() {
          model.constraints = [];
          angular.forEach(model.rangeIndexes.rangeindexList, function(val){
            var value = val.rangeElementIndex || val.rangeElementAttributeIndex || val.fieldIndex;
            var constraint =
              {
                'name': value.localname,
                'range':
                  {
                    'type': 'xs:'+ value.scalarType,
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
                  'name': (value.parentLocalname || value.localname),
                  'ns': (value.parentNamespaceUri || value.namespaceUri)
                };
            }
            if (value['parent-localname']) {
              constraint.range.attribute = {
                  'name': value.localname,
                  'ns': value.namespaceUri
                };
            }
            model.constraints.push(constraint);
          });
          angular.forEach(model.fields.fieldList, function(value){
            var constraint =
              {
                'name': value.field.fieldName,
                'facet': false,
                'word':
                  {
                    'field': {
                      'name': value.field.fieldName,
                      'collation': value.field.collation
                    }
                }
              };
            model.constraints.push(constraint);
          });
        }
      });
    }]);
});
