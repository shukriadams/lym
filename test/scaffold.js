describe('scafford tests', function() {
    this.timeout(20000);

    var fs = require('fs'),
        path = require('path'),
        assert = require('assert'),
        mkdirp = require('mkdirp'),
        child = require('child_process').execSync,
        testFolder = path.join(__dirname, '__scaffoldTest');


    before(function() {
        //if (fs.existsSync(testFolder))
        //    rddir(testFolder);
        if (!fs.existsSync(testFolder))
            mkdirp.sync(testFolder);
    });

    after(function() {
        rddir(testFolder);
    });

    it('should scaffold a website', function() {
        child('node ../lym scaffold --p ' + testFolder, { stdio:[0,1,2] });

        assert.equal(true, fs.existsSync(path.join(testFolder, 'assemble', 'layouts', 'default.hbs' )));
        assert.equal(true, fs.existsSync(path.join(testFolder, 'dev', '__js', 'bundle.js' )));
    });


    function rddir(dir){
        var items = fs.readdirSync(dir);
        for (var i = 0 ; i < items.length ; i ++){
            var item = path.join(dir, items[i]);
            if (fs.statSync(item).isDirectory()){
                return rddir(item);
            } else {
                fs.unlinkSync(item);
            }
        }

        fs.rmdirSync(dir);
    }
});