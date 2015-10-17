#!/usr/bin/env node
var grunt = require('grunt'),
    path = require('path'),
    fs = require('fs'),
    process = require('process'),
    yargs = require('yargs').argv,
    targetFolder = process.cwd(),
    configLoader = require('./nodeTasks/configLoader'),
    allowedCommands = ['dev', 'release', 'install', 'init', 'fast', 'scaffold', 'watch'];

var command = process.argv.length >= 3  ? process.argv[2] : null;
console.log('Running lym : ' + command);
 
// verify command
if (!command || allowedCommands.indexOf(command) == -1){
    console.log('Invalid command. Lym supports : ' + allowedCommands.join(', '));
    return;
}

 
// look for config override json
var config = {};
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

// override path
targetFolder = yargs.p || targetFolder;
targetFolder = path.resolve(targetFolder);

// load config from various places
config = configLoader.load(config, targetFolder);
// append cwd manually once we know it
config.lymConfig.cwd = targetFolder;


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

} else if (command === 'dev' || command === 'release' || command === 'fast') {

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

            console.log(ext + ' changed detected');

            var task = require('./grunt');
            task.grunt(config, {
                task : 'watch',
                isFast : false,
                targets : [ext]
            });

        })

} else {

    console.log('lym : invalid command. Available : ');
    console.log('lym install name|url :  installs a lym component via Bower name or git url');
    console.log('lym dev : builds in dev mode ');
    console.log('lym release : builds in release mode');

}
