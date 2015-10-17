/*
 * Builds a list of Javascript files to concatenate in what will be page.js files.
 * */

'use strict';

module.exports = function(grunt) {
    grunt.task.registerTask('lym-build-js-concat-list', 'Builds a list of Javascript files to concatenate', function(mode) {

        var array = [],
            path = require('path'),
            fileUtils = require('./fileUtils'),
            jf = require('jsonfile'),
            fs = require('fs'),
            lymConfig = grunt.config('lymConfig'),
            components = fileUtils.findComponents(lymConfig.componentFolder, grunt);

        // build list for all components for lym-components, in release mode only
        if (mode === 'release'){

            for (var i = 0 ; i < components.length ; i ++){
                var component = components[i],
                    componentJSFile = component.name + '.js',
                    componentFiles = fileUtils.getFilesIn(component.diskPath, grunt);

                if (componentFiles[componentJSFile]){
                    array.push(componentFiles[componentJSFile].diskPath);
                }
            }

            // merge array of concat js files with parent gruntfile concat file list
            var merged = array.concat(grunt.config('concat').components.src);
            grunt.config.set('concat.components.src', merged);

            // write debug, this should be switchable
            jf.writeFileSync(path.join(lymConfig.tempFolder, 'js', 'lym-component-concatenate-list.json'), merged);
        }

        // add parts to make the "page js" requirejs config.
        array= [];
        array.push( path.join(lymConfig.tempFolder, 'js', 'require-component-mappings.js' ));

        var mergedPages = array.concat(grunt.config('concat').pages.src);
        grunt.config.set('concat.pages.src', mergedPages);

    });
};