var chokidar = require('chokidar');
var anymatch = require('anymatch');
var fs = require('fs');
var exec = require('child_process').exec;
var notifier = require('node-notifier');

/**
 * Watcher
 *
 * @constructor
 * @param {string} workingPath
 * @param {Object} options
 */
var watcher = function(workingPath, options) {
    var pathes;

    // First check options:
    if (options.files) {
        if (typeof options.files === 'string') {
            this.matchers_ = [options.files];
        } else if (typeof options.files === 'object' && typeof options.files.length === 'number') {
            this.matchers_ = options.files;
        } else {
            console.log('Config is not in expected syntax: Incorrect files value!');
            console.log(options);
            process.exit(1);
        }
    }

    if (!options.path) {
        console.log('Config is not in expected syntax: No path value!');
        console.log(options);
        process.exit(1);
    }

    if (typeof options.path === 'string') {
        pathes = [options.path];
    } else if (typeof options.path === 'object' &&
            typeof options.path.length === 'number' &&
            options.path.length > 0) {
        pathes = options.path;
    } else {
        console.log('Config is not in expected syntax: Incorrect path value!');
        console.log(options);
        process.exit(1);
    }

    // Check pathes
    for (var key in pathes) {
        if (!fs.existsSync(workingPath + '/' + pathes[key])) {
            console.log('Directory does not exist: ' + workingPath + '/' + pathes[key]);
            process.exit(1);
        }
    }

    // Everthing fine, so save options
    this.options_ = options;

    // create debounce function
    this.runFunction_ = this.debounce(this.run, 1000);

    // and watch pathes
    chokidar.watch(pathes, {
        ignoreInitial: true,
        ignored: options.ignore || /[\/\\]\./,
        cwd: workingPath,
        awaitWriteFinish: true
    }).on('all', (this.onChange).bind(this));
};

/**
 * Options
 *
 * @private
 * @type {Object}
 */
watcher.prototype.options_ = null;

/**
 * Matchers
 *
 * @private
 * @type Array.<string>
 */
watcher.prototype.matchers_ = null;

/**
 * Debounce function
 *
 * @private
 * @type {Function}
 */
watcher.prototype.runFunction_ = null;

/**
 * onChange function of chokidar
 *
 * @param {string} event
 * @param {string} path
 */
watcher.prototype.onChange = function(event, path) {
    if (!anymatch(this.matchers_, path)) {
        return;
    }

    this.runFunction_();
};

/**
 * Executes the given command
 *
 * @param {function()} callback
 */
watcher.prototype.run = function(callback) {
    notifier.notify({
        title: 'Autoexec',
        message: 'Start building (' + this.options_.name + ')...',
        icon: __dirname + '/images/waiting.png'
    });

    exec(this.options_.exec, (function(error, stdout, stderr) {
        if (error !== null) {
            console.log('exec error: ' + error);

            notifier.notify({
                title: 'Autoexec',
                message: 'Build (' + this.options_.name + ') FAILED! Open console for more information',
                icon: __dirname + '/images/error.png'
            });
        } else {
            notifier.notify({
                title: 'Autoexec',
                message: 'Build (' + this.options_.name + ') successful',
                icon: __dirname + '/images/ok.png'
            });
        }

        callback();
    }).bind(this));
};

/**
 * Creates a debounced function of the given function
 *
 * @param {function(function())} func
 * @param {number} wait
 * @returns {Function}
 */
watcher.prototype.debounce = function(func, wait) {
    var timeout;
    var isBlocked = false;
    var isWaitingForUnblock = false;

    return function() {
        var context = this;
        if (isWaitingForUnblock) {
            return;
        }

        var later = function() {
            timeout = null;

            if (isBlocked ||
                    (context.options_.blocking && global.isGlobalBlocked)) {
                isWaitingForUnblock = true;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            } else {
                isBlocked = true;

                if (context.options_.blocking) {
                    global.isGlobalBlocked = true;
                }

                console.log(context.options_.name + ': Start');

                func.bind(context)(function() {
                    console.log(context.options_.name + ': Finished');
                    isBlocked = false;
                    isWaitingForUnblock = false;
                    if (context.options_.blocking) {
                        global.isGlobalBlocked = false;
                    }
                });
            }
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

module.exports = watcher;