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
  module.controller('AddChartWidgetCtrl', ['$modalInstance', '$scope', 'HighchartsHelper', 'facets', function ($modalInstance, $scope, HighchartsHelper, facets) {
      var facetName = Object.keys(facets)[0];
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
        size: {
          height: 250
        },
        facetName: facetName
      };

      var reloadSeriesData = function(facetName) {
        $scope.highChart.xAxis.title.text = facetName;
        $scope.previewHighChart = HighchartsHelper.chartFromConfig($scope.highChart, facets[facetName]);
      };

      $scope.chartTypes = HighchartsHelper.chartTypes();
      reloadSeriesData($scope.highChart.facetName);

      $scope.$watch(function() { 
        return $scope.highChart.facetName + $scope.highChart.options.chart.type + $scope.highChart.title.text;
      }, function() {
        reloadSeriesData($scope.highChart.facetName);
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
