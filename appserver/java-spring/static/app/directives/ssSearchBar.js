define(['app/module'], function (module) {

  /* jshint ignore:start */

  /*
   * @ngdoc directive
   * @name ssSearchBar
   * @restrict E
   *
   * @description
   * Directive for displaying a search input form and a button that
   * applies the text in the form to the search criteria
   */

  /* jshint ignore:end */

  module.directive('ssSearchBar', ['$http', function ($http) {
    return {
      restrict: 'E',
      templateUrl: '/app/directives/ssSearchBar.html',
      link: function (scope) {
        scope.suggest = function(val) {
          return $http.get('/v1/suggest', {params: {"qtext": val, "options":"opt-suggest"}})
          .then(function(response){
            return response.data.suggestions;
          });
        };
        scope.showTips = false;
      }
    };
  }]);
});
