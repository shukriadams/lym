/*
*
* */
exports.load = function(overrideConfig, cwd){

    var jf = require('jsonfile'),
        fs = require('fs'),
        _ = require("lodash"),
        path = require('path');

    // load default config in parent folder. We assume this always exists
    var defaultConfigPath = path.resolve(path.join(__dirname, '..' , 'lym.json')),
        config = jf.readFileSync(defaultConfigPath);

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
        var workingConfig = jf.readFileSync(workingConfigPath);
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

    return config;

};
