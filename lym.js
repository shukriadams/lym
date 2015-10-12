#!/usr/bin/env node
var grunt = require('grunt'),
    path = require('path'),
    fs = require('fs'),
    process = require('process'),
    yargs = require('yargs').argv,
    targetFolder = process.cwd(),
    configLoader = require('./nodeTasks/configLoader'),
    allowedCommands = ['dev', 'release', 'install', 'init', 'devf'];

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
targetFolder = yargs.path || targetFolder;
targetFolder = path.resolve(targetFolder);

// load config from various places
config = configLoader.load(config, targetFolder);



if (command === 'install'){

    // ensure component name
    var component = process.argv.length > 3 ?  process.argv[3] : null;
    if (!component){
        console.log('lym install requires a bower name or git url');
        return;
    }

    //
    var task = require('./nodeTasks/installComponent');
    task.install(component, targetFolder, config);

} else if(command === 'init'){

    // ensure component name
    var component = process.argv.length > 3 ?  process.argv[3] : null,
        init = require('./nodeTasks/initializeComponent');
    if (!component){
        console.log('lym init requires a bower name');
        return;
    }

    init.initialize(component, targetFolder, config);

} else if (command === 'dev' || command === 'release'|| command === 'devf') {

    // all other commands handled by grunt script
    var gruntOptions ={
        gruntfile: path.join(__dirname, 'gruntfile.js'),
        task : command,
        config : JSON.stringify(config),
        path : targetFolder
    };

    if (yargs.stack)
        gruntOptions.stack = true;
    if (yargs.config)
        gruntOptions.config = yargs.config;

    grunt.cli(gruntOptions);

} else if(command === 'watch') {

    /*
    var chokidar = require('chokidar'),
        child = require('child_process').execSync;

    var watcher = chokidar.watch(config.lymConfig.componentFolder, {
        //ignored: /[\/\\]\./,
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

            // all other commands handled by grunt script
            var gruntOptions = {
                gruntfile: path.join(__dirname, 'gruntfile.js'),
                task : 'watch',
                config : JSON.stringify(config),
                target : ext,
                path : targetFolder
            };

            if (yargs.stack)
                gruntOptions.stack = true;
            if (yargs.config)
                gruntOptions.config = yargs.config;

            // child('grunt watch --path '+ targetFolder + ' --target ' + ext + ' --config ' + JSON.stringify(config), { cwd : __dirname, stdio:[0,1,2] });
            grunt.cli(gruntOptions);

            console.log(require('util').inspect(grunt));

        })
*/
} else {

    console.log('lym : invalid command. Available : ');
    console.log('lym install name|url :  installs a lym component via Bower name or git url');
    console.log('lym dev : builds in dev mode ');
    console.log('lym release : builds in release mode');

}
