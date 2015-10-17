/*
*
* */
exports.install = function(pkg, config){

    var bower = require('bower'),
        jf = require('jsonfile'),
        http = require('http'),
        path = require('path'),
        mkdirp = require('mkdirp'),
        cpr = require('cpr'),
        fs = require('fs'),
        semver = require('semver'),
        fileUtils = require('./../gruntTasks/fileUtils'),
        customBowerConfig = fileUtils.findBowerSettings(config.lymConfig.cwd),
        init = require('./initializeComponent'),
        bowerFolder = path.join(config.lymConfig.cwd, customBowerConfig.directory || 'bower_components');

    bowerGet(pkg);

    // pkg must be a qualified package name, as declared on bower, and as stored on local file system
    // url and tag are optional
    function bowerGet(pkg, url, tag){

        // if tag provided, check if higher version already exists
        var download = true,
            // prefer url over pkg name, tag is optional
            bowerPullName = (url || pkg) + (tag ? '#' + tag : ''),
            bowerPackageFolder = path.join(bowerFolder, pkg);

        if (tag && fs.existsSync(bowerPackageFolder)){
            var bowerJsonPath = path.join(bowerFolder, pkg, '.bower.json');
            if (fs.existsSync(bowerJsonPath)){
                var bowerJson = jf.readFileSync(bowerJsonPath),
                    presentVersion = bowerJson._release;

                var diff = semver.diff(presentVersion, tag);
                if (diff === 'major'){
                    throw 'Incompatible packages - version ' + tag + ' requisted, but ' + presentVersion + ' already present.';
                }

                if (semver.gt(presentVersion, tag)){
                    console.log('A better version of ' + pkg + ' (' + presentVersion + ') is already installed.');
                    return;
                } else if (semver.eq(presentVersion, tag)){
                    console.log(pkg + ' is already installed');
                    download = false;
                }
            }
        }

        if (download){
            bower.commands

                .install( [ bowerPullName ], { save: false, forceLatest: true }, customBowerConfig)

                .on('error', function(error){
                    console.log('Failed to pull component ' + pkg + ' : ' + error);
                })

                .on('end', function (installed) {

                    if (Object.keys(installed).length > 0){
                        console.log('Bower downloaded component ' + pkg);
                    }

                    processPackage();
                });

        } else {
            processPackage();
        }


        function processPackage(){
            // copy to target folder
            var componentTargetPath = fileUtils.resolveComponent(config.lymConfig.componentFolder, pkg);
            componentTargetPath = componentTargetPath || path.join(config.lymConfig.componentFolder, pkg);
            if (!fs.existsSync(componentTargetPath)){
                mkdirp.sync(componentTargetPath);
            }

            // Copy bower package to components folder, UNLESS a git repo is detected at end location, in which
            // case skip but move on to handle dependencies. The git check is a safeguard to allow developing of
            // components inside components folder.
            if (fs.existsSync(path.join( componentTargetPath, '.git'))) {
                console.log('Component folder contains git clone of ' + pkg + ', Bower fetch skipped.');
            } else {
                var srcFolder = path.join(bowerFolder, pkg);
                cpr(srcFolder, componentTargetPath , function(){
                    console.log(pkg + ' copied to components folder.');
                    init.initialize(pkg, config.lymConfig.cwd, config);
                });
            }

            // process all dependencies
            var componentPath = path.join(bowerFolder, pkg, 'component.json');
            if (!fs.existsSync(componentPath)){
                console.log('No component.json found for ' + componentPath + ', skipping.');
                return;
            }

            var componentJson = jf.readFileSync(componentPath);
            if (!componentJson.dependencies){
                return;
            }

            for (var dep in componentJson.dependencies){
                getBowerPackageInfo(dep, function(url ,dep){
                    if (url){
                        bowerGet(dep, url, componentJson.dependencies[dep]);
                    }else  {
                        console.log('No url found for package ' + dep);
                    }
                });
            }
        }

    } // bowerGet()

    // gets bower info for a given package from bower registry. If no bower registry is explicitly provided, the official
    // bower registry is used
    function getBowerPackageInfo(pkg, callback){

        var registryUrl = customBowerConfig.registry || 'http://bower.herokuapp.com';
        registryUrl = registryUrl + '/packages/' + pkg;
        console.log('Fetching ' + pkg + ' info from ' + registryUrl);

        http.get(registryUrl, function(res) {
            var json = '';
            res.on('data', function(data) {
                json += data;
            });
            res.on('end', function() {
                try
                {
                    var pkgInfo = JSON.parse(json);
                    callback(pkgInfo.url ,pkg);
                }
                catch(ex){
                    console.log(ex);
                    callback(null, pkg);
                }
            });
        });
    }
};