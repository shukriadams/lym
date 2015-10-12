/*
* Creates a "page js" script for each file in the __js folder. This consists of the contents of each of those files, prepended
* with requirejs config which has already been concatenated into the pagebase.js
*
* */

'use strict';

module.exports = function(grunt) {
    grunt.task.registerTask('lym-build-page-scripts', '', function(mode) {

        var fs = require('fs'),
            path = require('path'),
            lymConfig = grunt.config('lymConfig'),
            fileUtils = require('./fileUtils'),
            dir = lymConfig.masterJSFolder,
            os = require('os'),
            pageBase = fs.readFileSync( path.join(lymConfig.tempFolder, 'js', 'pagescript-requirejs-config.js') ),
            lymEmpty = fs.readFileSync(  path.join( __dirname, '..', 'gruntTasks', 'script-lymEmpty.js') ),
            destinationFolder = mode === 'dev' ? lymConfig.devRoot : lymConfig.releaseRoot;

        if (!fs.existsSync(dir)){
            grunt.log.writeln('Script directory ' + dir + ' not found, skipping.');
            return;
        }

        var pageScriptPaths = fs.readdirSync(dir);

        for (var i = 0 ; i < pageScriptPaths.length ; i ++) {

            var pageScriptPath = pageScriptPaths[i],
                pageScript = fs.readFileSync(path.join(dir, pageScriptPath)).toString();

            // add overrides
            var requireOverrides = '',
                requireOverridesPathRelease = path.join(lymConfig.tempFolder, 'js', 'require-pathOverrides-release.js'),
                requireOverridesPath = path.join(lymConfig.tempFolder, 'js', 'require-pathOverrides-dev.js');

            if (mode === 'dev' && fs.existsSync(requireOverridesPath)){
                requireOverrides = fs.readFileSync(requireOverridesPath).toString();
            } else if (mode === 'release' && fs.existsSync(requireOverridesPathRelease)){
                requireOverrides = fs.readFileSync(requireOverridesPathRelease).toString();
            }

            // add semicolon for safety in case pagePage is not properly terminated
            pageScript =
                fileUtils.divider() + os.EOL +
                lymEmpty + os.EOL +
                fileUtils.divider() + os.EOL +
                pageBase + ';' + os.EOL +
                fileUtils.divider() + os.EOL +
                requireOverrides + os.EOL +
                fileUtils.divider() + os.EOL +
                pageScript + ';' + os.EOL;

            var targetDirectory = path.join(destinationFolder, lymConfig.jsFolder);
            fileUtils.ensureDirectory(targetDirectory);

            var writePath = path.join(destinationFolder, lymConfig.jsFolder, pageScriptPath);
            fs.writeFileSync(writePath, pageScript );
            grunt.verbose.writeln('Writing pagescript file ' + writePath);
        }
    });
};