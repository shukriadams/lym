/*
* This tests installation of component. There are two compromises
* 1 - ideally we'd run a git daemon locally and serve the component from that, right now component is served from bitbucket
* 2 - killing the bower registry process does not free up the port - call http://127.0.0.1:9543 in a browser seems to kill it for real
*
* Chain installation of components is tested. The chains are :
*
* Simple multiple links : 1 links to 2 + 3, 3 links to 4
* - lymTest1 depends on lymTest2 and lymTest3
* - lymTest3 depends on lymTest4
*
* Major version conflict : 5 and 6 depend on incompatible versions of 7
* - lymTest5 depends on lymTest7 version 1.0.0 and lymTest6
* - lymTest6 depends on lymTest7 version 2.0.0
*
* Minor conflicts : 8 an 9 depend on different but compatible versions of 10
* - lymTest8 depends on lymTest10 version 0.1.0 and lymTest9
* - lymTest9 depends on lymTest10 version 0.1.1
* - passes and lymtest10 0.1.1 wins
* */
'use strict';

describe('install component tests', function() {
    this.timeout(20000);
    var path = require('path'),
        rd = require(path.join(__dirname, '..', 'utils', 'rd')),
        fs = require('fs'),
        jf = require('jsonfile'),
        http = require('http'),
        assert = require('assert'),
        testFolder = path.join(__dirname, '__installTest'),
        bowerReg = require('child_process').exec,
        bowerRegProc = null,
        lym = require('../lym'),
        childSync = require('child_process').execSync;

    before(function() {

        bowerRegProc = bowerReg('node bowerRegistry', { cwd : __dirname , stdio:[0,1,2] });

    });


    beforeEach(function(){
        // scaffold a site
        if (fs.existsSync(testFolder))
            rd.rd(testFolder);

        if (!fs.exists(testFolder))
            fs.mkdirSync(testFolder);

        lym.scaffold('hello_world', {
            nomake : true,
            path : testFolder
        });

        // write bowerrc
        jf.writeFileSync(path.join(testFolder, '.bowerrc'), { "registry": 'http://127.0.0.1:9543' });

    });

    after(function() {
        // exit local bower registry
        bowerRegProc.kill('SIGTERM');
    });





    it('should install a chain of components', function(done) {

        childSync('node lymcli install lymtest1 --p ' + testFolder, { cwd : path.join(__dirname, '..'), stdio:[0,1,2] });

        var componentFolder = path.join(testFolder, 'dev', '__components');
        assert.equal(true, fs.existsSync(path.join(componentFolder, 'lymtest1', '.bower.json')), '.bower.json, lymtest1');
        assert.equal(true, fs.existsSync(path.join(componentFolder, 'lymtest1', 'component.json')), 'component.json, lymtest1');

        assert.equal(true, fs.existsSync(path.join(componentFolder, 'lymtest2', '.bower.json')), '.bower.json, lymtest2');
        assert.equal(true, fs.existsSync(path.join(componentFolder, 'lymtest2', 'component.json')), 'component.json, lymtest2');

        assert.equal(true, fs.existsSync(path.join(componentFolder, 'lymtest3', '.bower.json')), '.bower.json, lymtest3');
        assert.equal(true, fs.existsSync(path.join(componentFolder, 'lymtest3', 'component.json')), 'component.json, lymtest3');

        assert.equal(true, fs.existsSync(path.join(componentFolder, 'lymtest4', '.bower.json')), '.bower.json, lymtest4');
        assert.equal(true, fs.existsSync(path.join(componentFolder, 'lymtest4', 'component.json')), 'component.json, lymtest4');

        done();
    });

    it('should install a component and do a soft version override', function(done) {

        childSync('node lymcli install lymtest8 --p ' + testFolder, { cwd : path.join(__dirname, '..'), stdio:[0,1,2] });

        var componentFolder = path.join(testFolder, 'dev', '__components');
        assert.equal(true, fs.existsSync(path.join(componentFolder, 'lymtest8', '.bower.json')), '.bower.json, lymtest8');
        assert.equal(true, fs.existsSync(path.join(componentFolder, 'lymtest8', 'component.json')), 'component.json, lymtest8');

        assert.equal(true, fs.existsSync(path.join(componentFolder, 'lymtest9', '.bower.json')), '.bower.json, lymtest9');
        assert.equal(true, fs.existsSync(path.join(componentFolder, 'lymtest9', 'component.json')), 'component.json, lymtest9');

        assert.equal(true, fs.existsSync(path.join(componentFolder, 'lymtest10', '.bower.json')), '.bower.json, lymtest10');
        assert.equal(true, fs.existsSync(path.join(componentFolder, 'lymtest10', 'component.json')), 'component.json, lymtest10');

        // lymtest10 should be 0.1.1, not 0.1.0
        var lymtest10data = jf.readFileSync(path.join(componentFolder, 'lymtest10', '.bower.json'));
        assert.equal(lymtest10data._release, '0.1.1', 'lymttest10 version');
        done();
    });

});
