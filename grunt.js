/*
 * Supported tasks : dev|release|fast|watch. Default is dev.
 *
 * dev : Builds site in dev mode. Lym component javascript files are not concatenated,
 *       allowing for easier debugging. Webroot must be the dev folder so javascript files
 *       have to be nested within in this to be accessible.
 * release : Builds site in dev mode. Javascript files for Lym components are concatenated
 *           and placed in each JS bundle file.
 * watch : compiles minimal, meant to be called by watch job
 * fast : compiles the same as watch, meant to be called directly from CLI instead of from watcher.
 * */
exports.grunt = function(config, gruntOptions){

    var grunt = require('grunt'),
        fs = require('fs'),
        startTime = null,
        _ = require('lodash'),
        path = require('path'),
        task = gruntOptions.task,
        isFast = gruntOptions.fast,
        targets = gruntOptions.targets;

    // force working directory change, simulates gruntfile behavior
    process.chdir(__dirname);
    
    // workaround to bypass not using a gruntfile
    grunt.task.init = function() {};

    // Set task - allowed options are 'dev' and 'release'. 'dev' is forced if no task is specified.
    var mode = task === 'release' ? 'release' : 'dev',
        targetBuildFolder = mode === 'dev'  ? config.lymConfig.devRoot : config.lymConfig.releaseRoot;

    // second merge : default grunt settings - this will overwrite any grunt settings the caller may have passed in
    var gruntConfig = {

        pkg : grunt.file.readJSON(path.join(__dirname, 'package.json')),

        //
        assemble: {
            options: {
                flatten: true,
                data: [ config.lymConfig.componentFolder + '/**/*.{json,yml}', config.lymConfig.assembleFolder + '/data/**/*.{json,yml}'],
                layoutdir: config.lymConfig.assembleFolder + '/layouts',
                helpers: [ config.lymConfig.assembleFolder + '/helpers/**/*.js', config.lymConfig.componentFolder+ '/**/*helper.js']
            },
            site: {
                options: {
                    // include layouts in partials list to support using multiarea layouts
                    partials: [ config.lymConfig.componentFolder + '/**/*.hbs' , config.lymConfig.assembleFolder + '/partials/**/*.hbs', config.lymConfig.assembleFolder+ '/layouts/**/*.hbs' ]
                },
                files: [
                    { expand: true, cwd: config.lymConfig.assembleFolder + '/pages', src: ['**/*.hbs'], dest: targetBuildFolder + '/' }
                ]
            }
        },

        //
        copy: {
            compiled: {
                files: [
                    { src: [ 'bower_components/requirejs/require.js'], dest : path.join(targetBuildFolder, config.lymConfig.libFolder, 'require.js'), filter: 'isFile' },
                    { src: [ config.lymConfig.tempFolder + '/js/require-setup.js'], dest : path.join(targetBuildFolder, config.lymConfig.jsFolder, 'lym.js'), filter: 'isFile' }
                ]
            },
            uncompiled: {
                files: [
                    { src: [ 'bower_components/requirejs/require.js'], dest : path.join(targetBuildFolder, config.lymConfig.libFolder, 'require.js'), filter: 'isFile' }
                ]
            }

        },

        // Concatenates JS files. "Components" is all component main js files. "Pages" merges each bundle with require config.
        // In both cases, src array is populated by lym-build-js-concat-list task.
        concat: {
            components : {
                src : [],
                dest: path.join(config.lymConfig.releaseRoot, config.lymConfig.jsFolder, config.lymConfig.componentJsBundle + '.js' )
            },

            pages : {
                src : [],
                dest: path.join(config.lymConfig.tempFolder, 'js', 'pagescript-requirejs-config.js' )
            }

        },

        // Minifies JS files, used in release mode only
        uglify: {
            release : {
                files: [
                    { cwd: path.join(config.lymConfig.releaseRoot, config.lymConfig.libFolder), src: '**/*.js', dest:  path.join(config.lymConfig.releaseRoot, config.lymConfig.libFolder), expand: true },
                    { cwd: path.join(config.lymConfig.releaseRoot, config.lymConfig.jsFolder), src: '**/*.js', dest:  path.join(config.lymConfig.releaseRoot, config.lymConfig.jsFolder), expand: true }
                ]
            }
        },

        // Minifies CSS files, used in release mode only.
        cssmin: {
            release: {
                expand: true,
                cwd: path.join(config.lymConfig.releaseRoot, config.lymConfig.cssFolder),
                src: ['*.css', '!*.min.css'],
                dest: path.join(config.lymConfig.releaseRoot, config.lymConfig.cssFolder),
                ext: '.css'
            }
        }

    };

    // final merge - allows grunt settings passed in to overrite the static grunt settings defined above
    _.merge(gruntConfig, config);
    grunt.initConfig(gruntConfig);

    // Calculates lym execute time.
    grunt.registerTask('lym-start', function(){ startTime = new Date();  });
    grunt.registerTask('lym-end', function(){
        var diff = new Date().getTime() - startTime.getTime();
        console.log('Time : ' + diff + ' ms');
    });


    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('assemble');
    grunt.loadTasks('gruntTasks');


    // pull bower via node object to avoid dependency of host machine having global bower
    grunt.registerTask('bower', function(){
        var jf = require('jsonfile'),
            bower = require('bower'),
            customBowerConfig = {},
            done = this.async();

        if(fs.existsSync(path.join(__dirname, '.bowerrc'))){
            customBowerConfig = jf.readFileSync(path.join(__dirname, '.bowerrc'));
        }

        var bowerFile = jf.readFileSync(path.join(__dirname, 'bower.json')),
            bowerPackages = [];

        for (var d in bowerFile.dependencies){
            // note : this assumes bower package contains urls to repos
            bowerPackages.push(bowerFile.dependencies[d]);
        }

        bower.commands
            .install(bowerPackages, { save: false, forceLatest: true }, customBowerConfig)
            .on('end', function () {
                done();
            });
    });


    // Compiles SASS to CSS. Uses Node-sass
    grunt.registerTask('compass', function(){
        var done = this.async(),
            sass = require('node-sass'),
            mkdirp =  require('mkdirp'),
            glob = require("glob"),
            cssOutFolder = path.join(targetBuildFolder, config.lymConfig.cssFolder);

        if (!fs.existsSync(cssOutFolder))
            mkdirp.sync(cssOutFolder);

        glob(path.join(config.lymConfig.tempFolder, 'scss', '*.scss'), {}, function (er, files) {
            files.forEach(function(file, i ){
                var outfile = path.join(
                    cssOutFolder,
                    path.basename(file).substr(0, path.basename(file).length - 5) + '.css'); // remove .scss extension

                var result = sass.renderSync({
                    file: file
                });

                fs.writeFileSync(outfile, result.css);

                if (i == files.length - 1){
                    done();
                }
            });

        });
    });

    var devTasks = [
        'lym-start',
        'bower',
        'lym-vendor-copy:' + mode,
        'lym-check-versions',
        'lym-build-require-configs:' + mode,
        'lym-build-js-concat-list:' + mode,
        'lym-build-master-sass',
        'compass',
        'concat:components',
        'concat:pages',
        'assemble:site',
        'lym-build-page-scripts:' + mode,
        'copy:uncompiled',
        'lym-end'
    ];

    var devWatchTasks = [
        'lym-start',
        'compass',
        'assemble:site',
        'lym-end'
    ];

    if (targets){
        if (targets.indexOf('hbs') === -1)
            devWatchTasks.splice(devWatchTasks.indexOf('assemble:site'), 1);
        if (targets.indexOf('scss') === -1){
            devWatchTasks.splice(devWatchTasks.indexOf('compass'), 1);
        }
    }

    // remove "luxury" safety jobs to speed up building. This is still experimental.
    if (isFast){
        devTasks.splice(devTasks.indexOf('bower'), 1);
    }

    var releaseTasks = [
        'lym-start',
        'bower',
        'lym-vendor-copy:' + mode,
        'lym-check-versions',
        'lym-build-require-configs:' + mode,
        'lym-build-js-concat-list:' + mode,
        'lym-build-master-sass',
        'compass',
        'concat:components',
        'concat:pages',
        'assemble:site',
        'lym-build-page-scripts:' + mode,
        'copy:compiled',
        'uglify:release',
        'cssmin:release',
        'lym-end'
    ];

    if (!config.lymConfig.uglify){
        releaseTasks.splice(releaseTasks.indexOf('uglify:release'), 1);
    }

    if (!config.lymConfig.minify){
        releaseTasks.splice(releaseTasks.indexOf('cssmin:release'), 1);
    }


    grunt.registerTask('default', ['dev']);
    grunt.registerTask('dev', devTasks);
    grunt.registerTask('fast', devWatchTasks);
    grunt.registerTask('watch', devWatchTasks);
    grunt.registerTask('release', releaseTasks);

    // Finally run the tasks, with options and a callback when we're done
    grunt.tasks([task], { }, function() {
        console.log('Done running ' + task);
    });
};