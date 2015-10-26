/*
 * This is the "main" Lym file. Lymcli.js acts as a command-line-interface front for this file.
 *
 * */

'use strict';

var grunt = require('grunt'),
    path = require('path'),
    fs = require('fs'),
    process = require('process'),
    configLoader = require('./nodeTasks/configLoader');

function buildConfig(options){
    options = options || {};
    options.config = options.config || {};
    return configLoader.build(options.config, options.path);
}


/*
 * Installs a component.
 * */
module.exports.install = function(component, options){
    var config = buildConfig(options),
        task = require('./nodeTasks/installComponent');

    task.install(component, {
        config : config
    });
};


/*
 * Scaffolds a website from the given 'content' folder in /assets
 * */
module.exports.scaffold = function(content , options){
    var config = buildConfig(options),
        task = require('./nodeTasks/scaffold');

    task.scaffold(content , config, options.nomake);
};


/*
 *
 * */
module.exports.init = function(component, options){
    var config = buildConfig(options),
        task = require('./nodeTasks/initializeComponent');

    task.initialize(component, config);
};


/*
 *
 * */
module.exports.build = function(options){
    var config = buildConfig(options),
        task = require('./grunt');

    task.grunt(config, {
        task : 'build',
        stack : options.stack
    });
};


/*
 *
 * */
module.exports.release = function(options){
    var config = buildConfig(options),
        task = require('./grunt');

    task.grunt(config,{
        task : 'release',
        stack : options.stack
    });
};


/*
 *
 * */
module.exports.fast = function(options){
    var config = buildConfig(options),
        task = require('./grunt');

    task.grunt(config,{
        task : 'fast',
        stack : options.stack
    });
};


/*
*
* */
module.exports.watch = function(options){
    console.log('Lym is watching for changes ...');

    var config = buildConfig(options),
        chokidar = require('chokidar');

    var watcher = chokidar.watch([config.lymConfig.componentFolder, config.lymConfig.assembleFolder], {
        persistent: true
    });

    watcher
        .on('change', function(p) {
            var ext = path.extname(path.basename(p)).replace('.',''),
                allowedExtensions = ['scss', 'hbs'];

            if (allowedExtensions.indexOf(ext) === -1)
                return;

            console.log(ext + ' change detected');

            var task = require('./grunt');
            task.grunt(config, {
                task : 'watch',
                targets : [ext]
            });

        })
};