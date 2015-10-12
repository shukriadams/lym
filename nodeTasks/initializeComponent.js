/*
*
* */
exports.initialize = function(pkg, cwd, config){

    var bower = require('bower'),
        child = require('child_process').execSync,
        fork = require('child_process').fork,
        jf = require('jsonfile'),
        path = require('path'),
        fs = require('fs'),
        ncp = require('ncp'),
        fileUtils =require('./../gruntTasks/fileUtils'),
        componentFolder = fileUtils.resolveComponent(config.lymConfig.componentFolder, pkg);

    if (!fs.existsSync(componentFolder)){
        console.log('Initialization failed - component ' + pkg + ' not installed. Install it first.');
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
        var bowerJson = jf.readFileSync(bowerPath),
            depsCleanNames = [],
            deps = [];

        for (var depName in bowerJson.dependencies){
            depsCleanNames.push(depName);
            deps.push(depName + '#' + bowerJson.dependencies[depName]);
        }

        if (deps.length === 0){
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
                        var src = path.join(cwd, 'bower_components', dep),
                            pkpFolder = path.join(componentFolder, 'bower_components', dep);

                        fileUtils.ensureDirectory(path.join(componentFolder, 'bower_components'));
                        ncp(src, pkpFolder , function(){
                            done ++;
                            if (done>= deps.length){
                                doMake();
                            }
                        });
                    });

                });
        }
    }

    function doMake(){
        // do make.js stuff
        if (fs.existsSync(path.join(componentFolder, 'make.js'))){
            console.log('Running make for component ' + pkg);
            fork('make.js', { cwd : componentFolder, stdio:[0,1,2] });
        }

    }
};