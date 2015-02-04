module.exports = function (karma) {

  var files = require('../files').files;

  karma.set({
    basePath: '..',
    files: [].concat(files.angular('1.2.28'), files.lib, files.testLib, files.src, files.test),
    logLevel: karma.LOG_DEBUG,
    browsers: [ 'PhantomJS' ]
  });

};
