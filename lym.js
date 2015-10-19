#!/usr/bin/env node

'use strict';

var grunt = require('grunt'),
    path = require('path'),
    fs = require('fs'),
    process = require('process'),
    colors = require('colors'),
    yargs = require('yargs').argv,
    targetFolder = process.cwd(),
    config = {},
    configLoader = require('./nodeTasks/configLoader'),
    allowedCommands = {
        'build': {
            use : 'lym build',
            desc : 'Builds project in dev mode - no minification or concatenation'
        },
        'release': {
            use : 'lym release',
            desc :'Builds project in release mode - takes longer, css and js is compacted'
        },
        'install': {
            use : 'lym install [componentName]',
            desc :'Installs a lym-compatible component through Bower'
        },
        'init': {
            use : 'lym init [componentName]',
            desc : 'Initializes an installed component (components are automatically initiated when installed)'
        },
        'fast': {
            use : 'lym fast',
            desc : 'Fast build - this is the same build triggered by watch.'
        },
        'scaffold': {
            use : 'lym scaffold [contentName]',
            'desc' : 'Sets up a project in the current folder. Content name is optional.'
        },
        'watch': {
            use : 'lym watch',
            desc : 'Starts lym in watch mode - changing a hbs or scss file will trigger a fast rebuild. If you add new files or make extensive changes you should run lym build.'
        }
    };


// get and verify command. If fail, print info
var command = process.argv.length >= 3  ? process.argv[2] : null;
if (!command || allowedCommands[command]===undefined){

    console.log('Invalid or missingn command.\r\n'.red);
    console.log('Lym supports the following:');

    for (var p in allowedCommands){
        console.log(allowedCommands[p].use.green);
        console.log(allowedCommands[p].desc + '\r\n');
    }

    return;
}

// look for path in command line args
targetFolder = yargs.p || targetFolder;
targetFolder = path.resolve(targetFolder);
 
// look for config json in command line args
if (yargs.config){
    try
    {
        config = JSON.parse(yargs.config);
    }
    catch(ex)
    {
        console.log('Error parsing config JSON. Is config valid Json? ' + ex);
        return;
    }
}


// create/load/finalize final config
config = configLoader.build(config, targetFolder);



if (command === 'install'){

    // ensure component name
    var component = process.argv.length > 3 ?  process.argv[3] : null;
    if (!component){
        console.log('lym install requires a bower name or git url');
        return;
    }

    //
    var task = require('./nodeTasks/installComponent');
    task.install(component, config);

} else if(command === 'scaffold'){

    // content is optional
    var content = process.argv.length > 3 ?  process.argv[3] : null,
        task = require('./nodeTasks/scaffold');

    task.scaffold(config, {
        content : content || 'hello_world',
        nomake : yargs.nomake || false
    });

} else if(command === 'init'){

    var component = process.argv.length > 3 ?  process.argv[3] : null,
        task = require('./nodeTasks/initializeComponent');

    // ensure component name
    if (!component){
        console.log('lym init requires a bower name or url');
        return;
    }

    task.initialize(component, config);

} else if (command === 'build' || command === 'release' || command === 'fast') {

    var task = require('./grunt');

    task.grunt(config, {
        task : command,
        isFast : false,
        stack : yargs.stack
    });

} else if(command === 'watch') {

    console.log('Lym is watching for changes ...');

    var chokidar = require('chokidar'),
        child = require('child_process').execSync;

    var watcher = chokidar.watch([config.lymConfig.componentFolder, config.lymConfig.assembleFolder], {
        persistent: true
    });

    // something to use when events are received
    var log = console.log.bind(console);

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
                isFast : false,
                targets : [ext]
            });

        })
}