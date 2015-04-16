define([
  'app/module'
], function (module) {
  module.directive('fieldElements', ['ServerConfig',function(serverConfig) {
    'use strict';
    function link(scope, element, attrs) {
      scope.remove = function(index) {
        scope.fieldElements.splice(index, 1);
      };
      scope.add = function() {
        scope.fieldElements.push({
          'namespace-uri':'', 
          'localname':'', 
          'weight':1, 
          'attribute-namespace-uri':'', 
          'attribute-localname':'', 
          'attribute-value':''
        });
      };
    }
    // directive factory creates a link function
    return {
      restrict: 'E',
      templateUrl: '/app/directives/fieldElements.html',
      scope: {
        'fieldElements': '=',
        'title': '@'
      },
      link: link
    };
  }]);
});
