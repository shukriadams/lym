#!/usr/bin/env node

'use strict';

var process = require('process'),

    path = require('path'),
    yargs = require('yargs').argv,
    lym = require('./index'),
    lymCodes = require('./nodeTasks/lymCodes')(),
    colors = require('colors'),
    config  = {},
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

// optional arg
var workingFolder = yargs.p;


// get and verify command. If fail, print info
var command = process.argv.length >= 3  ? process.argv[2] : null;
if (!command || allowedCommands[command] === undefined){

    console.log(('[err' + lymCodes.exit.INVALID_COMMAND + '] ' + command +' is not a valid command.\r\n').red);
    console.log('Lym supports the following:\r\n');

    for (var p in allowedCommands){
        console.log(allowedCommands[p].use.green);
        console.log(allowedCommands[p].desc + '\r\n');
    }

    process.exit(1);
}


// look for config json in command line args
if (yargs.config){
    try
    {
        config = JSON.parse(yargs.config);
    }
    catch(ex)
    {
        console.log('[err' + lymCodes.exit.INVALID_CONFIG + '] Error parsing config JSON. Is config valid Json? ' + ex);
        process.exit(1);
    }
}


if (command === 'install'){

    var component = process.argv.length > 3 ?  process.argv[3] : null;
    lym.install(component, {
        config: config,
        path : workingFolder

    });

} else if(command === 'scaffold'){

    // content is optional
    var content = process.argv.length > 3 ?  process.argv[3] : null;

    // flag being mistaken for content. Todo : clunky fix, find something better
    if (content && content.indexOf('--') === 0)
        content = null;

    lym.scaffold(content , {
        config :config,
        path : workingFolder,
        nomake : yargs.nomake
    });

} else if(command === 'init'){

    var component = process.argv.length > 3 ?  process.argv[3] : null;

    lym.init(component, {
        config : config,
        path : workingFolder
    });

} else if (command === 'build' ) {

    lym.build({
        config :config,
        path : workingFolder
    });

} else if (command === 'release') {

    lym.release({
        config :config,
        path : workingFolder
    });

} else if (command === 'fast') {

    lym.fast({
        config :config,
        path : workingFolder
    });

} else if(command === 'watch') {

    lym.watch({
        config : config,
        path : workingFolder
    });

}