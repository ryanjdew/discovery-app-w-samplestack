define(['app/module'], function (module) {
  'use strict';
  /**
   * @ngdoc state
   * @name explore
   *
   * @description
   * TBD
   *
   */

  module.controller('exploreCtlr', ['$scope', '$location', 'MLSearchFactory', function ($scope, $location, searchFactory) {
      var mlSearch = searchFactory.newContext(),
          model = {
            page: 1,
            qtext: '',
            search: {}
          };

      (function init() {

        // run a search when the user logs in
        $scope.$watch('model.user.authenticated', function() {
          search();
        });

        // capture initial URL params in mlSearch and ctrl model
        mlSearch.fromParams().then(function() {
          // if there was remote input, capture it instead of param
          mlSearch.setText(model.qtext);
          updateSearchResults({});
        });

        // capture URL params (forward/back, etc.)
        $scope.$on('$locationChangeSuccess', function(e, newUrl, oldUrl){
          mlSearch.locationChange( newUrl, oldUrl ).then(function() {
            search();
          });
        });
      })();

      function updateSearchResults(data) {
        model.search = data;
        model.qtext = mlSearch.getText();
        model.page = mlSearch.getPage();

        $location.search( mlSearch.getParams() );
      }

      function search(qtext) {
        if ( arguments.length ) {
          model.qtext = qtext;
        }

        mlSearch
          .setText(model.qtext)
          .setPage(model.page)
          .search()
          .then(updateSearchResults);
      }

      angular.extend($scope, {
        model: model,
        search: search,
        toggleFacet: function toggleFacet(facetName, value) {
          mlSearch
            .toggleFacet( facetName, value )
            .search()
            .then(updateSearchResults);
        }
      });

    }]);

});
