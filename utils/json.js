/*
* Loads json files, forces sync (which lym uses throughout) and displays a more useful error message on fail.
* */
exports.read = function(path){
    var jf = require('jsonfile');

    try
    {
        return jf.readFileSync(path);
    }
    catch(ex)
    {
        throw 'Error loading json file : ' + path + ' : ' + path;
    }
};