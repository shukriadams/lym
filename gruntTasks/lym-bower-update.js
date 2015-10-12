/*
 * Invokes bower install on all components which have a 'bower.json' file in their root.
 * */

'use strict';

module.exports = function(grunt) {
    grunt.task.registerTask('lym-bower-update', 'Initializes component bower dependencies', function() {

        var fileUtils = require('./fileUtils'),
            fs = require('fs'),
            lymConfig = grunt.config('lymConfig'),
            path = require('path'),
            sys = require('sys'),
            semver = require('semver'),
            exec = require('child_process').execSync,
            fork = require('child_process').fork,
            jf = require('jsonfile'),
            deps = {},
            components = fileUtils.findComponents(lymConfig.componentFolder, grunt);

        for (var i = 0 ; i < components.length ; i ++){
            var component = components[i],
                folderPath = component.diskPath,
                bowerPath =  path.join(folderPath, 'bower.json');

            // do npm stuff
            if (fs.existsSync(path.join(folderPath, 'package.json'))){
                grunt.log.writeln('Running npm install for component ' + component.name);
                exec('npm install', { cwd : folderPath, stdio: 'pipe' });
            }

            // do bower stuff
            if (fs.existsSync(bowerPath)){
                // gather dependency and dependency version
                var bowerJson = jf.readFileSync(bowerPath);
                for (var dep in bowerJson.dependencies){
                    var depName = dep.toLowerCase();
                    deps[depName] = deps[depName] || {};
                    deps[depName][bowerJson.dependencies[depName].toLowerCase()] =
                        deps[depName][bowerJson.dependencies[depName].toLowerCase()] || [];

                    deps[depName][bowerJson.dependencies[dep].toLowerCase()].push(component.name);
                }

                grunt.log.writeln('Running bower for component ' + component.name);
                exec('bower install', { cwd : folderPath, stdio: 'pipe'});
            }

            // do make.js stuff
            if (fs.existsSync(path.join(folderPath, 'make.js'))){
                grunt.log.writeln('Running make for component ' + component.name);
                fork('make.js', { cwd : folderPath,  stdio: 'pipe'});
            }
        }

        // ensure dependencies are compatible
        for (var dep in deps){

            var componentList = '',
                failed = false;

            for (var thisVersion in deps[dep]){
                componentList += deps[dep][thisVersion].join(', ');
                for (var thatVersion in deps[dep]){
                    var diff = semver.diff(thisVersion, thatVersion);
                    if (diff === 'major'){
                        failed = true;
                    }
                }
            }

            if (failed){
                grunt.fail.fatal('Bower error : the components ' + componentList + ' import different versions of ' + dep + '.');
            }
        }

        grunt.verbose.writeln('Bower components map : ' + require('util').inspect(deps));
    })
};