/*
 *
 * */

'use strict';

module.exports = function(grunt) {
    grunt.task.registerTask('lym-check-versions', '', function() {

        var components = {},
            fs = require('fs'),
            path = require('path'),
            fileUtils = require('./fileUtils'),
            lymConfig = grunt.config('lymConfig'),
            semver = require('semver'),
            resolvedComponents = fileUtils.findComponents(lymConfig.componentFolder, grunt);

        // create raw list of component sass file paths.
        for (var i = 0 ; i < resolvedComponents.length ; i ++){
            var component = resolvedComponents[i];
            components[component.name] = component;
        }

        // include implied dependencies
        for (var p in components){
            if (!components.hasOwnProperty(p))
                continue;
            
            var component = components[p];
            if (!component.dependencies)
                continue;

            for (var dependency in component.dependencies){
                if (!components[dependency]){
                    var resolved = fileUtils.findComponent(resolvedComponents, dependency);
                    if (!resolved){
                        grunt.fail.fatal('Expected component ' + dependency + ' not found.');
                    }
                    components[resolved.name] =resolved;
                }
            }
        }

        // verify versions
        for (var componentName in components){
            for (var componentDependency in components[componentName].dependencies){

                // does dependency exist
                if (!components[componentDependency]){
                    grunt.fail.fatal('Component ' + componentName + ' depends on component ' + componentDependency + ', but the dependency was not found.');
                }

                var requiredVersion = components[componentName].dependencies[componentDependency],
                    availableVersion = components[componentDependency].version;

                if (!availableVersion){
                    grunt.log.writeln('Component ' + componentDependency + ' has no available version, most likely because it was not fetched with Bower. Skipping.');
                    continue;
                }

                var diff = semver.diff(availableVersion, requiredVersion);
                if (diff === 'major'){
                    grunt.fail.fatal('Component ' + componentName + ' depends on ' + componentDependency + ' version ' + requiredVersion + ', but version ' + availableVersion + ' was found.');
                }
            }
        }

    });
};