/*
*
* */

'use strict';

exports.initialize = function(pkg, config){

    var bower = require('bower'),
        child = require('child_process').execSync,
        fork = require('child_process').fork,
        path = require('path'),
        jf = require(path.join(__dirname, '..', 'utils', 'json')),
        fs = require('fs'),
        cpr = require('cpr'),
        fileUtils =require('./../gruntTasks/fileUtils'),
        componentFolder = fileUtils.resolveComponent(config.lymConfig.componentFolder, pkg);

    if (!pkg){
        console.log('lym init requires an installed component name.');
        return;
    }

    if (!fs.existsSync(componentFolder)){
        console.log('Initialization failed - ' + pkg + ' not found in component folder. Install it first.');
        return;
    }

    // do npm stuff
    if (fs.existsSync(path.join(componentFolder, 'package.json'))){
        console.log('Running npm install for component ' + pkg);
        child('npm install', { cwd : componentFolder, stdio:[0,1,2] });
    }

    // do bower stuff
    var bowerPath = path.join(componentFolder, 'bower.json');
    if (fs.existsSync(bowerPath)){
        // gather dependency and dependency version
        var bowerJson = jf.read(bowerPath),
            depsCleanNames = [],
            deps = [];

        for (var depName in bowerJson.dependencies){
            depsCleanNames.push(depName);
            deps.push(depName + '#' + bowerJson.dependencies[depName]);
        }

        if (deps.length === 0){
            // proceed directy to make if we don't need to download anything first
            doMake();
        } else {
            console.log('Running bower for component ' + pkg);

            bower.commands

                .install( deps, { save: false, forceLatest: true }, {})

                .on('error', function(error){
                    console.log('Failed to bower pull a dependecy for parent component ' + pkg + ' : ' + error);
                })

                .on('end', function () {
                    var done = 0;

                    // need to manually copy bower content from cwd bower folder to
                    // component bower folder because bower API will always send content to cwd.
                    depsCleanNames.forEach(function(dep){
                        var src = path.join(config.lymConfig.cwd, 'bower_components', dep),
                            pkpFolder = path.join(componentFolder, 'bower_components', dep);

                        fileUtils.ensureDirectory(path.join(componentFolder, 'bower_components'));
                        cpr(src, pkpFolder, { overwrite : true}, function(){
                            done ++;
                            if (done>= deps.length){
                                doMake();
                            }
                        });
                    });

                });
        }
    }

    console.log('Done initializing ' + pkg);

    function doMake(){
        // do make.js stuff
        if (fs.existsSync(path.join(componentFolder, 'make.js'))){
            console.log('Running make for component ' + pkg);
            fork('make.js', { cwd : componentFolder, stdio:[0,1,2] });
        }

    }
};