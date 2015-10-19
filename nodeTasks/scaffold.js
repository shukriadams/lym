/*
 * Sets up a new website in the working folder, by copying files from /assets/scaffold. Files are not copied if they already exist at target location.
 * */

'use strict';

exports.scaffold = function(config, options){

    var path = require('path'),
        fs = require('fs'),
        fileUtils = require('./../gruntTasks/fileUtils'),
        lymInitialize = require('./initializeComponent');

    console.log('Scaffolding website ... ');

    _process(path.join(__dirname, '..', 'assets', options.content), '/', config.lymConfig.cwd );

    //  force initialize all components in scaffolded content
    var components = fileUtils.findComponents(config.lymConfig.cwd);
    for (var i = 0 ; i< components.length ; i ++){
        if (!options.nomake)
            lymInitialize.initialize(components[i].name, config);
    }

    function _process(dir, relativeDir, destination){
        var items = fs.readdirSync(dir);

        for (var i = 0 ; i < items.length; i ++){
            var item = path.join(dir,items[i]);

            if (fs.statSync(item).isDirectory()){
                _process(item, path.join( relativeDir, items[i] ), destination);
            } else {

                var target = path.join(destination, relativeDir, items[i]);
                if (!fs.existsSync(target)){
                    fileUtils.ensureDirectory(path.dirname(target));

                    fs.writeFileSync(target, fs.readFileSync(item));

                    console.log('Added file ' + target);

                }
            }

        }
    }

};