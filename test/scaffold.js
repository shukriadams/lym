'use strict';

describe('scaffold tests', function() {
    this.timeout(20000);

    var fs = require('fs'),
        path = require('path'),
        assert = require('assert'),
        rd = require(path.join(__dirname, '..', 'utils', 'rd')),
        mkdirp = require('mkdirp'),
        lym = require('../lym'),
        testFolder = path.join(__dirname, '__scaffoldTest');

    beforeEach(function() {
        if (fs.existsSync(testFolder))
            rd.rd(testFolder);
        
        if (!fs.existsSync(testFolder))
            mkdirp.sync(testFolder);
    });

    after(function() {
        rd.rd(testFolder);
    });



    it('should scaffold a website ', function() {
        lym.scaffold('internal_dev' ,{
            path : testFolder,
            nomake :true
        });

        assert.equal(true, fs.existsSync(path.join(testFolder, 'assemble', 'layouts', 'default.hbs' )), "Handlebars file is missing");
        assert.equal(true, fs.existsSync(path.join(testFolder, 'dev', '__js', 'bundle1.js' )), "bundle.js is missing");
    });

});