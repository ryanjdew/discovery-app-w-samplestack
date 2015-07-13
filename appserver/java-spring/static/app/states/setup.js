define(['app/module'], function (module) {
  'use strict';

  module
    .controller('setupCtlr', [
      '$modal', '$scope', 'ServerConfig', 
      '$window', 'MLSearchFactory', 
      'newGeospatialIndexDialog', 'editGeospatialIndexDialog', 
      'newRangeIndexDialog', 'editRangeIndexDialog', 
      'fieldDialog', 
      'newChartWidgetDialog', 
      function (
        $modal, $scope, ServerConfig, 
        win, searchFactory, 
        newGeospatialIndexDialog, editGeospatialIndexDialog, 
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
      
      function constructDefaultSourceOptions(inIndexes, inDefaultSource) {
        var options = [];
        angular.forEach(inIndexes, function(val){
          var value = val['range-element-index'] || val['range-element-attribute-index'] || val['range-field-index'];
          var name = value.localname || value['field-name'];
          var type = value['scalar-type'];
          var collation = value.collation;
          var namespace = (value['parent-namespace-uri'] || value['namespace-uri']);
          
          var optVal = name +'|'+type+'|'+collation+'|'+namespace;
          var option = {};
          option.name = name;
          option.value = optVal;
          option.selected = inDefaultSource === optVal;
          options.push(option);
        });
        return options;
      }
      
      function convertToOption(inDefaultSource) {
        var result = [];
        if (inDefaultSource && inDefaultSource.options['default-suggestion-source']) {
          var range = inDefaultSource.options['default-suggestion-source'].range;
          result.push(range.element.name);
          result.push(range.type.substr(3));
          result.push(range.collation);
          result.push(range.element.ns);
        }
        return result.join('|');
      }

      updateSearchResults();

      function init() {
        ServerConfig.get().then(function(config){
          model.dataCollections = [];
          model.databaseName = config.databaseName;
          model.chartData = config.chartData;
          model.fields = config.fields;
          model.rangeIndexes = config.rangeIndexes;
          model.geospatialIndexes = config.geospatialIndexes;
          model.searchOptions = config.searchOptions;
          model.constraints = config.searchOptions.options.constraint;
          model.defaultSource = convertToOption(config.defaultSource);
          model.uiConfig = config.uiConfig;
          model.suggestOptions = constructDefaultSourceOptions(model.rangeIndexes['range-index-list'], model.defaultSource);
          model.databaseOptions = config.databases;
          $scope.$emit('uiConfigChanged', model.uiConfig);
        });
      }
      init();

      angular.extend($scope, {
        model: model,
        state: 'database',
        mlSearch: mlSearch,
        setDatabase: function() {
          ServerConfig.setDatabase({'database-name': model.databaseName}).then(function() {
            init();
          }, handleError);
        },
        addDatabase: function() {
          $modal.open({
            template : '<div>'+
              '<div class="modal-header">'+
                '<button type="button" class="close" ng-click="$dismiss()">'+
                  '<span aria-hidden="true">&times;</span>'+
                  '<span class="sr-only">Close</span>'+
                '</button>'+
                '<h4 class="modal-title">Add Database</h4>'+
              '</div>'+
              '<div class="modal-body">'+
                '<form name="form">'+
                  '<div class="form-group">'+
                    '<label class="control-label">Database Name </label>&nbsp;'+
                    '<input type="text" ng-model="dbName" />'+
                  '</div>'+
                  '<div class="clearfix">'+
                    '<button type="button" class="btn btn-primary pull-right" ng-click="add()">Add</button>'+
                  '</div>'+
                '</form>'+
              '</div>'+
            '</div>',
            controller : ['$modalInstance', '$scope', function ($modalInstance, $scope) {
              $scope.add = function() {
                if ($scope.dbName && $scope.dbName !== '') {
                  $modalInstance.close($scope.dbName);
                }
              };
            }],
            size: 'sm'
          }).result.then(function(dbName) {
            model.databaseOptions.push(dbName);
            model.databaseOptions.sort();
            model.databaseName = dbName;
          });
        },
        loadData: function() {
          ServerConfig.loadData($scope.loadDirectory).then(function(data) {
            $scope.loadDataInfo = data;
            model.dataCollections.push(data.collection);
            updateSearchResults().then(function() {
              $scope.state = 'appearance';
            });
          }, handleError);
        },
        removeCollection: function(index) {
          ServerConfig.removeDataCollection(model.dataCollections[index]).then(function() {
            model.dataCollections.splice(index, 1);
            updateSearchResults().then(function() {
              $scope.state = 'appearance';
            });
          }, handleError);
        },
        clearLoadDataInfo: function() {
          $scope.loadDataInfo = null;
        },
        clearError: function() {
          $scope.error = null;
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
        addGeospatialIndex: function() {
          newGeospatialIndexDialog().then(function(index) {
            model.geospatialIndexes['geospatial-index-list'].push(index);
            ServerConfig.setGeospatialIndexes(model.geospatialIndexes).then(updateSearchResults, handleError);
          });
        },
        editGeospatialIndex: function(gsIndex) {
          editGeospatialIndexDialog(gsIndex).then(function() {
            ServerConfig.setGeospatialIndexes(model.geospatialIndexes).then(updateSearchResults, handleError);
          });
        },
        removeGeospatialIndex: function(index) {
          model.geospatialIndexes['geospatial-index-list'].splice(index, 1);
          ServerConfig.setGeospatialIndexes(model.geospatialIndexes).then(updateSearchResults, handleError);
        },
        removeField: function(fieldPosition) {
          model.fields['field-list'].splice(fieldPosition, 1);
          ServerConfig.setFields(model.fields).then(updateSearchResults, handleError);
        },
        addField: function() {
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
          model.constraints.splice(index,1);
        },
        submitConstraints: function() {
          model.searchOptions.options.constraint = model.constraints;
          ServerConfig.setSearchOptions(model.searchOptions).then(function() {
            updateSearchResults().then(function() {
              $scope.state = 'appearance';
            });
          },handleError);
        },
        saveDefaultSource: function(){
          var chosenOption = model.defaultSource;
          var parts = chosenOption.split('|');
          var data = {
            'options':{
              'default-suggestion-source':{
                'range': {
                  'type': 'xs:'+parts[1],
                  'facet': true,
                  'collation': parts[2],
                  'element': {
                    'ns': parts[3],
                    'name': parts[0]
                  }
                }
              }
            }
          };
          ServerConfig.setSuggestionSource(data).then(updateSearchResults, handleError);
        },
        getDefaultSourceOpts: function(){
          model.suggestOptions = constructDefaultSourceOptions(model.rangeIndexes['range-index-list'], model.defaultSource);
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
        },
        setUiConfig: function() {
          ServerConfig.setUiConfig(model.uiConfig)
          .then(
            function() {
              updateSearchResults();
              $scope.$emit('uiConfigChanged', model.uiConfig);
            }, handleError);
        },
        getUiConfig: function() {
          model.uiConfig = ServerConfig.getUiConfig();
          return model.uiConfig;
        }
      });
    }]);
});
