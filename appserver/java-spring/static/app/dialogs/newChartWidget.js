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
  module.controller('AddChartWidgetCtrl', ['$modalInstance', '$scope', 'HighchartsHelper', 'facets', 'MLSearchFactory', function ($modalInstance, $scope, HighchartsHelper, facets, searchFactory) {
      $scope.facetSortOptions = {};
      $scope.xSortOptions = {
        accept: function (sourceItemHandleScope, destSortableScope) {
          return destSortableScope.modelValue.length < 1;
        }
      };
      $scope.chartFacetOptions = Object.keys(facets);
      var facetName = $scope.chartFacetOptions[0];
      $scope.chartFacetOptions.splice(0,1);
      var mlSearch = searchFactory.newContext();
      $scope.facets = facets;
      $scope.highChart = {
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
        xAxisMapping: [facetName],
        xAxisCategoriesMapping: [],
        yAxis: {
          title: {text: null}
        },
        yAxisMapping: ['$frequency'],
        zAxis: {
          title: {text: null}
        },
        size: {
          height: 250
        },
        facetLimit: 15
      };

      var reloadSeriesData = function() {
        $scope.highChart.xAxis.title.text = $scope.highChart.xAxisMapping[0];
        $scope.highChart.yAxis.title.text = $scope.highChart.yAxisMapping[0];
        $scope.previewHighChart = HighchartsHelper.chartFromConfig(
          $scope.highChart, 
          mlSearch
        );
      };

      $scope.chartTypes = HighchartsHelper.chartTypes();
      reloadSeriesData();

      $scope.$watch(function() { 
        return $scope.chartFacetOptions.join('') + $scope.highChart.options.chart.type + $scope.highChart.title.text + $scope.highChart.facetLimit;
      }, function() {
        reloadSeriesData();
      });

      $scope.add = function () {
        $modalInstance.close($scope.highChart);
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
      return function (facets) {
        return $modal.open({
          templateUrl : '/app/dialogs/newChartWidget.html',
          controller : 'AddChartWidgetCtrl',
          size : 'lg',
          resolve: {
            facets: function() {
              return facets;
            }
          }
        }).result;
      };
    }
  ]);

});
