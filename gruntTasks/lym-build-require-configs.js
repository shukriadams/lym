/*
 * Resolves paths to components needed by requirejs.
 * */

'use strict';

module.exports = function(grunt) {
    grunt.task.registerTask('lym-build-require-configs', 'Generates fragments for requirejs config', function(mode) {

        var paths = {},
            path = require('path'),
            fs = require('fs'),
            fileUtils = require('./fileUtils'),
            lymConfig = grunt.config('lymConfig'),
            components = fileUtils.findComponents(lymConfig.componentFolder, grunt);

        // build paths to components. These are used in dev mode only
        if (mode === 'dev'){

            // in dev mode, we point to each component js file separately, so each must be mapped
            for (var i = 0 ; i < components.length ; i ++){
                var component = components[i],
                    componentJSFile = component.name + '.js',
                    componentFiles = fileUtils.getFilesIn(component.diskPath, grunt);

                if (componentFiles[componentJSFile]){
                    paths[component.name] = component.requirePath + componentFiles[componentJSFile].requirePath;
                    paths[component.name] = fileUtils.noLeadSlash(paths[component.name]);
                }
            }
        } else {
            // in release mode, all components are concatenated into one file, which all components must be mapped to
            for (var i = 0 ; i < components.length ; i ++){
                var component = components[i];
                paths[component.name] = path.join(lymConfig.jsFolder, lymConfig.componentJsBundle).replace(/\\/g, "/");
                paths[component.name] = fileUtils.noLeadSlash(paths[component.name]);
            }
        }

        // create temp cache folders
        fileUtils.ensureDirectory(path.join(lymConfig.tempFolder, 'js'));

        // write component list.
        var lymComponentsFileContent = 'require.config({ paths : ' + JSON.stringify(paths) + ' });';
        fs.writeFileSync( path.join(lymConfig.tempFolder, 'js', 'require-component-mappings.js'), lymComponentsFileContent);

    });

};