define(['app/module'], function (module) {

  /**
   * @ngdoc controller
   * @kind constructor
   * @name AddIndexCtrl
   * @description
   * Controller for {@link loginDialog}. The controller is injected by the
   * $modal service. Provides a user interface for authenticating a user.
   * Upon instantiation the `loginDialogCtlr` creates an empty instance of
   * {@link ssSession} for handling authentication. See
   * <a href="http://angular-ui.github.io/bootstrap/"
   * target="_blank">ui.bootstrap.modal</a> for more information.
   *
   * @param {angular.Scope} $scope (injected)
   * @param {ui.bootstrap.modal.$modalInstance} $modalInstance (injected)
   * @param {object} ssSession Session object
   * @param {object} mlAuth Authentication object
   *
   * @property {string} $scope.error If present, indicates what error
   * occurred while attempting to authenticate a user.
   * @property {string} $scope.session.username The username input.
   * @property {string} $scope.session.password The password input.
   */
  module.controller('AddChartWidgetCtrl', ['$modalInstance', '$scope', 'HighchartsHelper', 'facets', 'highchartConfig', 'MLSearchFactory', function ($modalInstance, $scope, HighchartsHelper, facets, highchartConfig, searchFactory) {
      $scope.facetSortOptions = {};
      $scope.xSortOptions = {
        accept: function (sourceItemHandleScope, destSortableScope) {
          return destSortableScope.modelValue.length < 1;
        }
      };
      $scope.chartFacetOptions = Object.keys(facets);
      var facetName = $scope.chartFacetOptions[0];
      $scope.chartFacetOptions.splice(0,1);
      $scope.facets = facets;
      $scope.highchartConfig = highchartConfig || {
        options: {
            //This is the Main Highcharts chart config. Any Highchart options are valid here.
            //will be overriden by values specified below.
            chart: {
                type: 'bar'
            },
            tooltip: {
                style: {
                    padding: 10,
                    fontWeight: 'bold'
                }
            }
        },
        title: {
          text: 'Title'
        },
        xAxis: {
          title: {text: facetName}
        },
        xAxisMLConstraint: facetName,
        xAxisCategoriesMLConstraint: null,
        yAxis: {
          title: {text: null}
        },
        yAxisMLConstraint: '$frequency',
        zAxis: {
          title: {text: null}
        },
        zAxisMLConstraint: null,
        size: {
          height: 250
        },
        resultLimit: 15
      };

      if (!$scope.highchartConfig.xAxis) {
        $scope.highchartConfig.xAxis = {
          title: {text: null}
        };
      }
      if (!$scope.highchartConfig.yAxis) {
        $scope.highchartConfig.yAxis = {
          title: {text: null}
        };
      }

      $scope.xAxisMLConstraint = _.without([$scope.highchartConfig.xAxisMLConstraint], null, undefined);
      $scope.xAxisCategoriesMLConstraint = _.without([$scope.highchartConfig.xAxisCategoriesMLConstraint], null, undefined);
      $scope.yAxisMLConstraint = _.without([$scope.highchartConfig.yAxisMLConstraint], null, undefined);
      $scope.zAxisMLConstraint = _.without([$scope.highchartConfig.zAxisMLConstraint], null, undefined);

      var reloadSeriesData = function() {
        $scope.previewHighChart = HighchartsHelper.chartFromConfig($scope.highchartConfig);
      };

      $scope.chartTypes = HighchartsHelper.chartTypes();
      reloadSeriesData();

      $scope.$watch(function() { 
        return $scope.highchartConfig.options.chart.type + $scope.highchartConfig.xAxis.title.text + $scope.highchartConfig.yAxis.title.text + $scope.highchartConfig.title.text + $scope.highchartConfig.resultLimit;
      }, function() {
        reloadSeriesData();
      });
      
      $scope.$watch(function() { 
        return $scope.xAxisMLConstraint.length + '' + $scope.yAxisMLConstraint.length + '' + $scope.xAxisCategoriesMLConstraint.length;
      }, function() {
        $scope.highchartConfig.xAxisMLConstraint = $scope.xAxisMLConstraint[0];
        $scope.highchartConfig.yAxisMLConstraint = $scope.yAxisMLConstraint[0];
        $scope.highchartConfig.zAxisMLConstraint = $scope.zAxisMLConstraint[0];
        $scope.highchartConfig.xAxisCategoriesMLConstraint = $scope.xAxisCategoriesMLConstraint[0];
        reloadSeriesData();
      });
      
      $scope.save = function () {
        $modalInstance.close($scope.highchartConfig);
      };
    }]);

  /**
   * @ngdoc dialog
   * @name newRangeIndexDialog
   * @kind function
   * @description A UI Bootstrap component that provides a modal dialog for
   * adding a range index to the application.
   */
  module.factory('newChartWidgetDialog', [
    '$modal',
    function ($modal) {
      return function (facets, highchartConfig) {
        return $modal.open({
          templateUrl : '/app/dialogs/newChartWidget.html',
          controller : 'AddChartWidgetCtrl',
          size : 'lg',
          resolve: {
            facets: function() {
              return facets;
            },
            highchartConfig: function() {
              return highchartConfig;
            }
          }
        }).result;
      };
    }
  ]);

});
