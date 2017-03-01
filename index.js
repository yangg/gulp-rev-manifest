'use strict';

var through = require('through2');
var crc     = require('crc');
var Path    = require('path');
var fs      = require('fs');
const Settings = require('yaml-settings');
var manifestConfig;
var options = {
  dest: process.cwd()
}

function rev() {
  if(!manifestConfig) {
    throw new Error('Cannot call before init');
  }
  return through.obj(function (file, enc, cb) {
    if (file.isNull()) {
      cb(null, file);
      return;
    }

    let filePath = Path.relative(options.dest, file.path).replace(/\\/g, '/');
    let hash = version(file.contents);
    manifestConfig.set([filePath], hash);
    cb(null, file);
  });
}


function version(content) {
  return crc.crc32(content).toString(16)
}

rev.version = version;

rev.init = function(opt) {
  Object.assign(options, opt);
  
  manifestConfig = new Settings('manifest.yml', options.dest);
  manifestConfig.init();
  manifestConfig.delay = 50
  rev.get = manifestConfig.get.bind(manifestConfig);
  rev.set = manifestConfig.set.bind(manifestConfig);
}


module.exports = rev;
