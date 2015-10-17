var path = require('path');
var fs = require('fs');
var watcher = require('./watcher');

global.isGlobalBlocked = false;

// CLI options:
var options = require('nomnom')
        .option('config', {
            abbr: 'c',
            default: 'autoexec.json',
            help: 'JSON config file'
        })
        .option('path', {
            abbr: 'p',
            default: '.',
            help: 'working directory'
        })
        .option('version', {
            abbr: 'v',
            flag: true,
            help: 'print version and exit',
            callback: function() {
                var package = require('./package.json');
                return package.name + 'version ' + package.version;
            }
        })
        .parse();

var workingPath = path.normalize(process.cwd() + '/' + options.path);
var configFile = process.cwd() + '/' + options.config;

// check config file
fs.exists(configFile, function(exists) {
    if (!exists) {
        console.log('File ' + configFile + ' does not exist!');
        return;
    }

    try {
        var config = require(configFile);
    } catch (e) {
        console.log('File not readable. Syntax error?', e);
        return;
    }

    if (!config || !config.config || typeof config.config !== 'object' ||
            typeof config.config.length !== 'number') {
        console.log('Config is not in expected syntax!');
        return;
    }

    // Start watcher for every path
    for (var key in config.config) {
        new watcher(workingPath, config.config[key]);
    }
});


