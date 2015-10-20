// deletes a directory and all content synchronously

exports.rd = function(dir){
    var path = require('path'),
        fs = require('fs');
    _rd(dir);

    function _rd(dir)
    {
        var items = fs.readdirSync(dir);
        for (var i = 0 ; i < items.length ; i ++){
            var item = path.join(dir, items[i]);
            if (fs.statSync(item).isDirectory()){
                _rd(item);
            } else {
                fs.unlinkSync(item);
            }
        }

        fs.rmdirSync(dir);
    }


};