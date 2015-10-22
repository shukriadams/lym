// deletes a directory and all content synchronously. Used by unit tests only.
exports.rd = function(dir, maxTries){
    // gave up on Windows and brute forced directory
    if (!maxTries)
        maxTries = 20;

    var tries = 0,
        delay = 200;

    if (process.platform === 'win32'){
        windowsDelete();
    } else {
        rimraf.sync(dir);
    }

    function windowsDelete(){
        try
        {
            require('child_process').execSync('rd ' + dir + '  /s /q');
        }catch(ex)
        {
            tries ++;
            if (tries < maxTries){
                console.log(dir + ' delete failed, trying again ...');
                setTimeout(windowsDelete, delay);
            }
        }
    }
};