define(['app/module'], function (module) {
  'use strict';
  /**
   * @ngdoc state
   * @name details
   *
   * @description
   * TBD
   *
   */

  module.controller('docCtlr', ['$scope', 'MLRest', '$stateParams', function ($scope, mlRest, $stateParams) {
      var XML_CHAR_MAP = {
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;'
      };

      function escapeXml (s) {
        return s.replace(/[<>&"]/g, function (ch) {
          return XML_CHAR_MAP[ch];
        }).replace(/([^\n\s]+)(&lt;[^\/])/g, '$1\n$2');
      }
      var model = {
        // your model stuff here
        detail: {},
        uri: $stateParams.uri
      };

      if (/\.xml$/.test(model.uri)) {
        model.type = 'xml';
      } else if (/\.json$/.test(model.uri)) {
        model.type = 'json';
      } else {
        model.type = 'binary';
      }

      if (model.type !== 'binary') {
        mlRest.getDocument(model.uri, { format: 'json', transform: 'simple-html' }).then(function(response) {
          model.html = response.data.transform;
          if (model.type === 'xml') {
            model.detail = prettyPrintOne(escapeXml(response.data.source), 'xml');
          } else {
            model.detail = response.data.source;
          }
        });
      }
      angular.extend($scope, {
        model: model,
        state: 'Display'
      });
    }]);

});
