'use strict';

describe('scaffold tests', function() {
    this.timeout(20000);

    var fs = require('fs'),
        path = require('path'),
        assert = require('assert'),
        mkdirp = require('mkdirp'),
        child = require('child_process').execSync,
        testFolder = path.join(__dirname, '__scaffoldTest');

    before(function() {
        if (!fs.existsSync(testFolder))
            mkdirp.sync(testFolder);
    });

    after(function() {
        rddir(testFolder);
    });

    it('should scaffold a website', function() {
        child('node lym scaffold internal_dev --nomake --p ' + testFolder, { cwd : path.join(__dirname, '..'), stdio:[0,1,2] });

        assert.equal(true, fs.existsSync(path.join(testFolder, 'assemble', 'layouts', 'default.hbs' )), "Handlebars file is missing");
        assert.equal(true, fs.existsSync(path.join(testFolder, 'dev', '__js', 'bundle1.js' )), "bundle.js is missing");
    });

    // deletes dir and all content. todo : move to common utils
    function rddir(dir){
        try{
            var items = fs.readdirSync(dir);
            for (var i = 0 ; i < items.length ; i ++){
                var item = path.join(dir, items[i]);
                if (fs.statSync(item).isDirectory()){
                    rddir(item);
                } else {
                    fs.unlinkSync(item);
                }
            }

            fs.rmdirSync(dir);
        }
        catch(ex)
        {
            console.log(ex);
        }
    }
});