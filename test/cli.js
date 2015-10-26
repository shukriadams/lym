/*
* Tests calls via cli
* */

'use strict';

describe('cli tests', function() {
    this.timeout(20000);

    var fs = require('fs'),
        path = require('path'),
        assert = require('assert'),
        sync = require('child_process').execSync,
        async = require('child_process').exec,
        mkdirp = require('mkdirp'),
        rd = require(path.join(__dirname, '..', 'utils', 'rd')),
        lymCodes = require(path.join(__dirname, '..', 'nodeTasks', 'lymCodes'))(),
        testFolder = path.join(__dirname, '__cliTest');

    assert = require(path.join(__dirname, 'asserts')).extend(assert);

    beforeEach(function() {
        if (fs.existsSync(testFolder))
            rd.rd(testFolder);
    });


    it('should scaffold default website, using no content name ', function() {
        sync('node lym scaffold --p ' + testFolder, { cwd : path.join(__dirname, '..'), stdio:[0,1,2] });

        assert.equal(true, fs.existsSync(path.join(testFolder, 'assemble', 'layouts', 'default.hbs' )), "Handlebars file is missing");
        assert.equal(true, fs.existsSync(path.join(testFolder, 'dev', '__js', 'bundle.js' )), "bundle.js is missing");
    });


    it('should scaffold a website', function() {
        sync('node lym scaffold internal_dev --nomake --p ' + testFolder, { cwd : path.join(__dirname, '..'), stdio:[0,1,2] });

        assert.equal(true, fs.existsSync(path.join(testFolder, 'assemble', 'layouts', 'default.hbs' )), "Handlebars file is missing");
        assert.equal(true, fs.existsSync(path.join(testFolder, 'dev', '__js', 'bundle1.js' )), "bundle.js is missing");
    });

    it('should install a component', function() {

        sync('node lym install lymtest4 --p ' + testFolder, { cwd : path.join(__dirname, '..'), stdio:[0,1,2] });

        var componentFolder = path.join(testFolder, 'dev', '__components', 'lymtest4');
        assert.equal(true, fs.existsSync(path.join(componentFolder, '.bower.json')), '.bower.json');
        assert.equal(true, fs.existsSync(path.join(componentFolder, 'component.json')), 'component.json');
    });

    it('should build a website in dev mode', function() {
        sync('node lym scaffold --p ' + testFolder, { cwd : path.join(__dirname, '..'), stdio:[0,1,2] });
        sync('node lym build --p ' + testFolder, { cwd : path.join(__dirname, '..'), stdio:[0,1,2] });

        // presence of 1 built file is enough
        assert.equal(true, fs.existsSync(path.join(testFolder, 'dev', 'index.html' )), "index.html is missing");
    });

    it('should build a website in release mode', function() {
        sync('node lym scaffold --p ' + testFolder, { cwd : path.join(__dirname, '..'), stdio:[0,1,2] });
        sync('node lym release --p ' + testFolder, { cwd : path.join(__dirname, '..'), stdio:[0,1,2] });

        // presence of 1 built file is enough
        assert.equal(true, fs.existsSync(path.join(testFolder, 'release', 'index.html' )), "index.html is missing");
    });

    it('should build a website in watch mode', function(done) {
        sync('node lym scaffold --p ' + testFolder, { cwd : path.join(__dirname, '..'), stdio:[0,1,2] });
        var watchProcess = async('node lym watch --p ' + testFolder, { cwd : path.join(__dirname, '..'), stdio:[0,1,2] });

        setTimeout(function(){
            // change file
            console.log('changing hbs file');
            fs.writeFileSync(path.join(testFolder, 'assemble', 'layouts', 'default.hbs' ), '[test-value] {{>body}}');
            setTimeout(function(){
                console.log('checking output');
                var content = fs.readFileSync(path.join(testFolder, 'dev', 'index.html' ), 'utf8');
                assert.equal(true, content.indexOf('[test-value]') !== -1, "index.html is missing");
                watchProcess.kill();
                done();
            }, 2000);

        },2000)
    });


    it('should build a website in fast mode', function() {
        sync('node lym scaffold --p ' + testFolder, { cwd : path.join(__dirname, '..'), stdio:[0,1,2] });
        sync('node lym fast --p ' + testFolder, { cwd : path.join(__dirname, '..'), stdio:[0,1,2] });

        // presence of 1 built file is enough
        assert.equal(true, fs.existsSync(path.join(testFolder, 'dev', 'index.html' )), "index.html is missing");
    });

});