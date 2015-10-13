/*
 *
 * */
exports.scaffold = function(cwd, config){
    var path = require('path'),
        fs = require('fs'),
        fileUtils = require('./../gruntTasks/fileUtils');

    console.log('Scaffolding website ... ');

    _process(path.join(__dirname, '..', 'assets', 'assemble'), '/');

    function _process(dir, relativeDir){
        var items = fs.readdirSync(dir);

        for (var i = 0 ; i < items.length; i ++){
            var item = path.join(dir,items[i]);

            if (fs.statSync(item).isDirectory()){
                _process(item, path.join( relativeDir, items[i] ));
            } else {

                var target = path.join(config.lymConfig.assembleFolder, relativeDir, items[i]);
                if (!fs.existsSync(target)){
                    fileUtils.ensureDirectory(path.dirname(target));

                    fs.writeFileSync(target, fs.readFileSync(item));

                    console.log('Added file ' + target);

                }
            }

        }
    }

};