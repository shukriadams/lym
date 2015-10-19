/*
* Loads default lym.config and file system config, also does final runtime changes and resolving of folder
* */

'use strict';

exports.build = function(overrideConfig, cwd){

    var path = require('path'),
        jf = require(path.join(__dirname, '..', 'utils', 'json')),
        fs = require('fs'),
        _ = require("lodash");

    // load default config in parent folder. We assume this always exists
    var defaultConfigPath = path.resolve(path.join(__dirname, '..' , 'lym.json')),
        config = jf.read(defaultConfigPath);

    // is there an override folder in working directory?
    var workingConfigPath = path.join(cwd, 'lym.json'),
        workingConfigExists = fs.existsSync(workingConfigPath);

    // warn on double config
    if (workingConfigExists && Object.keys(overrideConfig).length){
        console.log('Warning, ignoring working folder contains lym.json ; config was passed in from command line.');
    }

    if (Object.keys(overrideConfig).length){
        _.merge(config, overrideConfig);
        console.log('Using config from command line');
    } else if(workingConfigExists){
        var workingConfig = jf.read(workingConfigPath);
        _.merge(config, workingConfig);
        console.log('Using config from working folder');
    } else {
        console.log('Using default lym config.');
    }

    // resolve all paths in config. Note all paths are forced to unix
    config.lymConfig.assembleFolder = path.join(cwd, config.lymConfig.assembleFolder).replace(/\\/g, "/");
    config.lymConfig.devRoot = path.join(cwd, config.lymConfig.devRoot).replace(/\\/g, "/");
    config.lymConfig.releaseRoot = path.join(cwd, config.lymConfig.releaseRoot).replace(/\\/g, "/");
    config.lymConfig.tempFolder = path.join(cwd, config.lymConfig.tempFolder).replace(/\\/g, "/");

    // force component and master js folders into build folder
    config.lymConfig.componentFolder = path.join(config.lymConfig.devRoot, config.lymConfig.componentFolder).replace(/\\/g, "/");
    config.lymConfig.masterJSFolder = path.join(config.lymConfig.devRoot, config.lymConfig.masterJSFolder).replace(/\\/g, "/");

    // finally, append cwd to config so we have it available wherever needed
    config.lymConfig.cwd = cwd;

    return config;

};
