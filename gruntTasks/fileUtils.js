/*
 * Divider for prettifying concatenated files
 * */

'use strict';



exports.divider = function(){
  return '// ==================================================================;';
};


/*
 * Gets a list of all files nested under root folder.
 * */
exports.getFilesIn = function(root, grunt){
    var fs = require('fs'),
        // Files in node and bower folders should not be treated as component files.
        // Bower files must linked to directly via requirejs definitions
        ignoredFolders = ['node_modules', 'bower_components'],
        path = require('path'),
        result = {};

    // look for cached component list in grunt object
    if (grunt){
        var cachedData = grunt.config('lym.cache.getFilesIn.' + root);
        if (cachedData){
            return cachedData
        }
    }

    _getFilesIn(root, '');
    grunt.config.set('lym.cache.getFilesIn.' + root, result);
    return result;




    function _getFilesIn(currentPath, webPath){

        var folderName = path.basename(currentPath).toLowerCase();
        if (!! ~ignoredFolders.indexOf(folderName)){
            return;
        }

        var items = fs.readdirSync(currentPath);
        for (var i = 0 ; i < items.length ; i ++){
            var item = unixPath(path.join(currentPath, items[i]));

            // is directory
            if (fs.statSync(item).isDirectory()){
                _getFilesIn(item, webPath + '/' + path.basename(item));
                continue;
            }

            // is file
            var relativePath = item.replace(root, ''),
                extension = path.extname(relativePath);

            // Calculate require path for js files. this path is relative to the component folder.
            // It needs the component's path relative to webroot for a complete path
            var requirePath = null;
            if (extension === '.js'){
                requirePath = webPath + '/' + path.basename(item);
                requirePath = requirePath.substr(0,requirePath.length -3 ); // clip extension off for valid require
            }

            result[path.basename(item)] = {
                diskPath : item,            // absolute path of the file on disk
                requirePath : requirePath,  // PARTIAL path a js file needs to path to require. This must be combined with component require path for a full require path
                extension : extension,
                relativePath : relativePath
            };
        }
    }
};


/*
 * Converts paths to unix format, which is used as standard for all OS's
 * */
function unixPath(path){
    return path.replace(/\\/g, "/");
};
exports.unixPath = unixPath;


/*
 *  Returns an array of all components under the given root folder. A component is any folder that contains a
 *  'component.json' file. Components cannot be nested under other components.
 *
 *  Grunt is optional, and used to cache search.
 * */
exports.findComponents = function(root, grunt){
    var fs = require('fs'),
        path = require('path'),
        jf = require('jsonfile'),
        componentFolders = [];

    // look for cached component list in grunt object
    if (grunt){
        var cachedData = grunt.config('lym.cache.findComponents');
        if (cachedData){
            return cachedData
        }
    }

    _findComponentFolders(root, '');

    grunt.config.set('lym.cache.findComponents', componentFolders);
    return componentFolders;

    function _findComponentFolders(dir, webPath){

        var items = fs.readdirSync(dir),
            componentJson = null,
            bowerJson = null,
            isComponent = false;

        // first check for component.json in all files in this folder
        for (var i = 0 ; i < items.length ; i ++){
            var item = unixPath(items[i]);

            // presence of component.json file flags folder as component root
            if (item.toLowerCase() === 'component.json'){
                isComponent = true;
                componentJson = jf.readFileSync(path.join(dir, item));
            }

            if (item.toLowerCase() === '.bower.json'){
                bowerJson = jf.readFileSync(path.join(dir, item));
            }
        }

        if (isComponent){
            var relativePath = dir.replace(root, '');

            // remove leading slash from path, component name is expected to start with directory name
            if (relativePath.indexOf('/') === 0 || relativePath.indexOf('\\') === 0)
                relativePath = relativePath.substr(1);

            // todo : add duplicate component name check

            componentFolders.push({
                relativePath : relativePath,                // path relative to app root
                diskPath : dir,                     // absolute path of the file on disk
                version : bowerJson? bowerJson._release : null, // get version from bower file if it exists
                requirePath : webPath + '/' + path.basename(dir),   //
                dependencies : componentJson.dependencies || {},
                name : path.basename(relativePath)
            });

        } else {

            // if not a component, recurse search in subfolders.
            // this prevents components being nested inside other components
            for (var i = 0 ; i < items.length ; i ++){
                var item = unixPath(path.join(dir, items[i]));

                // subdirectory found, recurse that
                if (fs.statSync(item).isDirectory()){
                    _findComponentFolders(item, webPath + '/' + path.basename(dir));
                }
            }

        }
    }

};


/*
 * Finds a component by name, from the list of components (as returned by this.findComponents)
 * */
exports.findComponent = function(resolvedComponents, name){
    for (var i = 0 ; i < resolvedComponents.length; i ++){
        if (resolvedComponents[i].name === name)
        return resolvedComponents[i];
    }
    return null;
};


/*
* Resolves the folder path for the given component
* */
exports.resolveComponent = function(root, name){
    var fs = require('fs'),
        path = require('path');

    return _find(root);

    function _find(dir){
        var items = fs.readdirSync(dir),
            dirName = path.basename(dir);

        for (var i = 0 ; i < items.length ; i ++){
            var item = items[i];
            if (dirName === name && item.toLowerCase() === 'component.json'){
                return dir;
            }

            // subdirectory found, recurse that
            if (fs.statSync(path.join(dir,item)).isDirectory()){
                return _find(path.join(dir,item));
            }
        }
    };
};


/*
 * Creates a path if it doesn't exist, regardless of depth.
 * */
exports.ensureDirectory = function(path){
    var fs = require('fs');
    var mkdirp = require('mkdirp');

    if (!fs.existsSync(path)){
        mkdirp.sync(path);
    }
};


/*
 * Builds path bridge from path to point where lym intersects
 * */
exports.findIntersect = function(cwd, tracePath){
    var path = require('path'),
        output = '';

    // force unix paths
    cwd = cwd.replace(/\\/g, "/");


    function split(p){
        var result = [];
        while (true){
            var temp = path.join(p, '../');
            if (temp === p)
                break;
            p = temp;
            result.push(p);
        }
        return result;
    }

    var paths = split(cwd);

    while (true){

        output = path.basename(tracePath) + '/' + output;

        var temp = path.join(tracePath, '../');
        if (temp === tracePath)
            break;

        tracePath = temp;
        if (!!~paths.indexOf(tracePath))
            return output;
    }
    throw 'failed to find path';
};


/*
 * Converts a relative (partial) path to an absolute one (relative to drive root)
 * */
exports.absolutePath = function(relPath){
    var path = require('path'),
        runtimeRoot = path.join(__dirname, '/..');

    return path.join(runtimeRoot, relPath);
};


/*
 * Removes leading slash.
 * */
exports.noLeadSlash = function(path){
    if (!path)
        return path;

    while(path.indexOf('/') === 0){
        path = path.substr(1);
    }
    return path;
};