var fs = require('fs'),
    path = require('path');

fs.writeFile(path.join(__dirname, 'test.txt'), "[123]", function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("Test file written.");
});