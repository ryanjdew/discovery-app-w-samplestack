module.exports = function(app) {

  app
  .provider('scriptLoader', function() {
    // configurable options
    var timeout = 10000;

    this.setTimeout = function(duration) {
      timeout = duration;
    };

    this.$get = ['$q', function($q) {
      var service = {}, win = window, doc = win.document, bod = document.body;

      service.loadScript = function(url) {
        console.log('loading '+url);
        var deferred = $q.defer();
        var scr = doc.createElement('script');
        var done = false;
        scr.type = 'text/javascript';
        scr.src = url;
        var to = win.setTimeout(function() {
          // reject if we aren't done
          if (!done) {
            deferred.reject();
          }
        },timeout);

        // setup our load function
        scr.onload = scr.onreadystatechange = function() {
          if (!done && (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete')) {
            // we are done
            deferred.resolve();
            done = true;
            // clean it up
            scr.onload = scr.onreadystatechange = null;
            if (scr.parentNode) {
              scr.parentNode.removeChild(scr);
            }
            // clear the timeout for good measure
            win.clearTimeout(to);
          }
        }

        bod.appendChild(scr);

        return deferred.promise;
      };

      return service;

    }];

  });
};