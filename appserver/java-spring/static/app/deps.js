/*
app/deps.js

Load all dependency modules files  and return an array of their angular module
names.
 */

require.config({
  paths: {
    /* jshint ignore: start */
    'prettify': 'deps/google-code-prettify/bin/prettify.min',
    'lodash': 'deps/lodash/dist/lodash.compat',
    'angular': 'deps/angular/angular',
    'ui-router': 'deps/angular-ui-router/release/angular-ui-router',
    'state-helper': 'deps/angular-ui-router.stateHelper/statehelper',
    'ui-bootstrap': 'deps/angular-bootstrap/ui-bootstrap-tpls',
    'angular-sanitize': 'deps/angular-sanitize/angular-sanitize',
    'ng-markdown': 'deps/ngMarkdown/wizMarkdown/wizMarkdown',
    'marked': 'deps/marked/lib/marked',
    'angular-marked': 'deps/angular-marked/angular-marked',
    'jquery': 'deps/jquery/dist/jquery',
    'highcharts': 'deps/highcharts/highcharts',
    'highcharts-ng': 'deps/highcharts-ng/dist/highcharts-ng',
    'highlightjs': 'deps/highlightjs/highlight.pack',
    'json': 'deps/requirejs-plugins/src/json',
    'text': 'deps/requirejs-plugins/lib/text',
    'ng-tags-input': 'deps/ng-tags-input/ng-tags-input',
    'ml-utils': 'deps/ml-utils/ml-utils.min',
    'ml-common-ng': 'deps/ml-common-ng/dist/ml-common-ng.min',
    'ml-search-ng': 'deps/ml-search-ng/dist/ml-search-ng',
    'ml-search-ng-tpls': 'deps/ml-search-ng/dist/ml-search-ng-tpls.min',
    'ng-sortable': 'deps/ng-sortable/dist/ng-sortable.min',
    'stacktrace-js':'deps/stacktrace-js/dist/stacktrace',
    'jstzdetect': 'deps/jstzdetect/jstz',
    'ng-json-explorer': 'deps/ng-json-explorer/dist/angular-json-explorer.min'
    /* jshint ignore: end */
  },

  shim: {
    'angular': { exports: 'angular', deps: ['jquery', 'prettify'] },
    'angular-mocks': { deps: ['angular'] },
    'ui-router': { deps: ['angular'] },
    'state-helper': { deps: ['angular', 'ui-router'] },
    'ui-bootstrap': { deps: ['angular'] },
    'highcharts-ng': { deps: ['angular', 'highcharts'] },
    'highcharts': { deps: ['jquery'], exports: 'Highcharts' },
    'angular-sanitize': { deps: ['angular'] },
    'ng-markdown': { deps: ['angular', 'angular-sanitize'] },
    'angular-marked': { deps: ['angular'] },
    'highlightjs': { exports: 'hljs' },
    'ng-tags-input': { deps: ['angular'] },
    'ml-utils': { deps: ['angular'] },
    'ml-common-ng': { deps: ['angular','ml-utils'] },
    'ml-search-ng': { deps: ['angular','ml-common-ng'] },
    'ml-search-ng-tpls': { deps: ['angular','ml-search-ng'] },
    'ng-sortable': { deps: ['angular','ui-bootstrap'] },
    'jstzdetect': { exports: 'jstz' },
    'ng-json-explorer': { deps: ['angular'] }
  }
});

define(
  [
    // first include those that we actually need to "handle" while we load
    // them here.  List them first so that only those that need special
    // handling need to be referenced in the callback function.
    'lodash',
    'angular',

    'stacktrace-js',
    'marked',
    'highlightjs',
    'jstzdetect',
    'stacktrace-js',
    'ui-router',
    'state-helper',
    'ui-bootstrap',
    'highcharts',
    'highcharts-ng',
    'angular-marked',
    'angular-sanitize',
    'ng-markdown',
    'ng-sortable',
    'ng-tags-input',
    'ml-utils',
    'ml-common-ng',
    'ml-search-ng',
    'ml-search-ng-tpls',

    '_marklogic/marklogic'
  ],
  function (lodash, angular, stacktrace, marked, hljs, jstz) {

    // lodash and angular are made global as a convenience.
    window._ = lodash;
    window.angular = angular;
    window.marked = marked;
    window.jstz = jstz;
    window.stacktrace = stacktrace;
    marked.setOptions({
      gfm: true,
      highlight: function (code) {
        return hljs.highlightAuto(code).value;
      }
    });


    return [
      'ui.router',
      'ui.router.stateHelper',
      'ui.bootstrap',
      'ui.sortable',
      'highcharts-ng',
      'hc.marked',
      'ngSanitize',
      'wiz.markdown',
      'ngTagsInput',
      'ml.common',
      'ml.search',
      'ml.search.tpls',
      'ml.utils',
      'ngJsonExplorer',

      '_marklogic'
    ];
  }
);
