/*
*
* */
exports.install = function(pkg ,targetFolder, config){

    var bower = require('bower'),
        jf = require('jsonfile'),
        http = require('http'),
        path = require('path'),
        mkdirp = require('mkdirp'),
        ncp = require('ncp'),
        fs = require('fs'),
        osenv = require('osenv'),
        customBowerConfig = findBowerSettings(),
        fileUtils = require('./../gruntTasks/fileUtils'),
        init = require('./initializeComponent'),
        bowerFolder = path.join(targetFolder, customBowerConfig.directory || 'bower_components');

    bowerGet(pkg);

    // try to find bower settings file, this should be moved to common lib
    function findBowerSettings(){
        // look in working folder
        var bowerrcPath = path.join(targetFolder, '.bowerrc');
        if(fs.existsSync(bowerrcPath)){
            console.log('Found local .bowerrc settings file.');
            return jf.readFileSync(bowerrcPath);
        }

        var home = osenv.home();
        bowerrcPath = path.join(home, '.bowerrc');
        if(fs.existsSync(bowerrcPath)){
            console.log('Found HOME .bowerrc settings file.');
            return jf.readFileSync(bowerrcPath);
        }

        return {};
    }

    // gets bower info for a given package from bower registry. If no bower registry is explicitly provided, the offcial
    // bower registry is used
    function getBowerPackageInfo(pkg, done){
        var registryUrl = customBowerConfig.registry || 'http://bower.herokuapp.com';
        registryUrl = registryUrl + '/packages/' + pkg;
        console.log('Fetching ' + pkg + ' info from ' + registryUrl);
        http.get(registryUrl, function(res) {
            var json = '';
            res.on('data', function(resData) {
                json += resData;
            });
            res.on('end', function() {
                try{
                    var pkgInfo = JSON.parse(json);
                    done(pkgInfo.url ,pkg);
                }catch(ex){
                    console.log(ex);
                    done(null, pkg);
                }
            });
        });

    }

    // pkg must be a qualified package name, as declared on bower, and as stored on local file system
    // url and tag are optional
    function bowerGet(pkg, url, tag){

        // prefer url over pkg name, tag is optional
        var bowerPullName = (url || pkg) + (tag ? '#' + tag : '');

        bower.commands

            .install( [ bowerPullName ], { save: false, forceLatest: true }, customBowerConfig)

            .on('error', function(error){
                console.log('Failed to pull component ' + pkg + ' : ' + error);
            })

            .on('end', function (installed) {

                if (Object.keys(installed).length > 0){
                    console.log('Bower fetched component ' + pkg);
                }

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
                    ncp(srcFolder, componentTargetPath , function(){
                        console.log(pkg + ' successfully installed.');
                        init.initialize(pkg, targetFolder, config);
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


            });

    } // bowerGet()

};