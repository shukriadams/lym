/*
* Installs a component. Component must be be a registered Bower name.
* */
'use strict';

exports.install = function(component, options){

    var bower = require('bower'),
        http = require('http'),
        path = require('path'),
        jf = require(path.join(__dirname, '..', 'utils', 'json')),
        mkdirp = require('mkdirp'),
        cpr = require('cpr'),
        fs = require('fs'),
        colors = require('colors'),
        semver = require('semver'),
        fileUtils = require('./../gruntTasks/fileUtils'),
        customBowerConfig = fileUtils.findBowerSettings(options.config.lymConfig.cwd),
        init = require('./initializeComponent'),
        bowerDirectory = require('bower-directory'),
        packagesToFetch = {},
        bowerFolder = bowerDirectory.sync();

    // ensure component name
    if (!component){
        console.log('lym install requires a bower name'.red);
        return;
    }

    bowerGet(component);

    // pkg must be a qualified package name, as declared on bower, and as stored on local file system
    // url and tag are optional
    function bowerGet(pkg, url, tag){
        // if tag provided, check if higher version already exists
        var download = true,
            // prefer url over pkg name, tag is optional
            bowerPullName = (url || pkg) + (tag ? '#' + tag : ''),
            bowerPackageFolder = path.join(bowerFolder, pkg);

        // if the package already exists, check version difference, fail on major, and overwrite/surrender on minor
        if (tag && fs.existsSync(bowerPackageFolder)){
            var bowerJsonPath = path.join(bowerFolder, pkg, '.bower.json');
            if (fs.existsSync(bowerJsonPath)){
                var bowerJson = jf.read(bowerJsonPath),
                    presentVersion = bowerJson._release;

                var diff = semver.diff(presentVersion, tag);

                if (diff === 'major'){
                    console.log(('Error - incompatible versions of ' + pkg + ' : '  + tag + ' requested, ' + presentVersion + ' already present.').red);
                    return;
                }

                if (semver.gt(presentVersion, tag)){
                    console.log(('A better version of ' + pkg + ' (' + presentVersion + ') is already installed.').yellow);
                    download = false;
                } else if (semver.eq(presentVersion, tag)){
                    console.log((pkg + ' is already installed').yellow);
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


        // Handles package after downloading, or if downloading is unnecessary.
        function processPackage(){

            // create component folder
            var componentTargetPath = fileUtils.resolveComponent(options.config.lymConfig.componentFolder, pkg);
            componentTargetPath = componentTargetPath || path.join(options.config.lymConfig.componentFolder, pkg);
            if (!fs.existsSync(componentTargetPath)){
                mkdirp.sync(componentTargetPath);
            }

            // Copy bower package to components folder, UNLESS a git repo is detected at end location, in which
            // case skip but move on to handle dependencies. The git check is a safeguard to allow developing of
            // components inside components folder.
            if (fs.existsSync(path.join( componentTargetPath, '.git'))) {
                console.log(('Installed version of ' + pkg + ' contains git clone, will not overwrite.').yellow);
            } else {
                var srcFolder = path.join(bowerFolder, pkg);
                //console.log('Copying ' + pkg + (tag? '#' + tag:'') + ' to components folder...');
                cpr(srcFolder, componentTargetPath, {overwrite : true}, function(err, files){
                    console.log((pkg + ' copied to components folder.').green);
                    init.initialize(pkg, options.config);
                });
            }

            // process all dependencies
            var componentPath = path.join(bowerFolder, pkg, 'component.json');
            if (!fs.existsSync(componentPath)){
                console.log('No component.json found for ' + componentPath + ', skipping.');
                return;
            }

            var componentJson = jf.read(componentPath);

            // will not exist for primary package
            if (packagesToFetch[pkg])
                packagesToFetch[pkg].processed = true;

            if (!componentJson.dependencies){
                startNextDependencyDownload();
                return;
            }



            // set up list of dependencies - dependencies will be fetched in series (one after next) to prevent disk io collisions.
            for (var dep in componentJson.dependencies){
                var overwrite = true;
                if (packagesToFetch[dep]){
                    overwrite= false;
                    var diff = semver.diff(packagesToFetch[dep].tag, componentJson.dependencies[dep]);

                    if (diff === 'major'){
                        throw 'Error - incompatible versions of ' + dep + '.';
                    }

                    if (semver.lt(packagesToFetch[dep].tag, componentJson.dependencies[dep])){
                        overwrite = true;
                    }
                }

                if (overwrite){
                    packagesToFetch[dep] = {
                        name : dep,
                        info : false,
                        processed : false,
                        tag : componentJson.dependencies[dep]
                    };
                }
            }

            for (var dep in packagesToFetch){
                if (packagesToFetch[dep].info)
                    continue;

                getBowerPackageInfo(dep, function(url ,dep){
                    packagesToFetch[dep].info = true;
                    packagesToFetch[dep].url = url;

                    if (!url){
                        console.log('No url found for package ' + dep);
                    }

                    // _try_ to start dependency downloads.
                    startNextDependencyDownload();
                });
            }


        }

    } // bowerGet()


    // tries to start downloading the next dependency. will
    function startNextDependencyDownload(){

        var ready = true,
            next = null;

        for (var dep in packagesToFetch){
            // if any package is still awaiting bower info, wait downloading
            if (!packagesToFetch[dep].info) {
                ready = false;
                break;
            }

            if (!packagesToFetch[dep].processed)
                next = packagesToFetch[dep];
        }

        if (!ready || !next)
            return;

        bowerGet(next.name, next.url, next.tag);
    }


    // Gets bower info for a given package from bower registry. If no bower registry is explicitly provided, the official
    // bower registry is used
    // returns two args : url pkg can be found at, and pkg name
    function getBowerPackageInfo(pkg, callback){

        var registryUrl = customBowerConfig.registry || 'http://bower.herokuapp.com';
        registryUrl = registryUrl + '/packages/' + pkg;
        console.log(('Looking up info for package ' + pkg + ' from ' + registryUrl).cyan);

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