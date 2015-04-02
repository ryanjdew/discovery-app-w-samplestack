module.exports = function(app) {

  // capitalize first letter of a string
  app.filter('capitalize', function() {
    return function(input) {
      if (input) {
        input = input[0].toUpperCase() + input.substr(1);
      }
      return input;
    }
  });

}