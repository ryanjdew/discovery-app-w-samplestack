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

  module.directive('ssSearchBar', ['MLSearchFactory',function (searchFactory) {
    return {
      restrict: 'E',
      templateUrl: '/app/directives/ssSearchBar.html',
      link: function (scope) {
        mlSearch = searchFactory.newContext();
        scope.suggest = function(val) {
          return mlSearch.suggest(val).then(function(resp) {
            console.log(resp);
            return resp.suggestions;
          });
        };
        scope.showTips = false;
      }
    };
  }]);
});
