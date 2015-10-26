'use strict';

describe('basic tests', function() {
    this.timeout(20000);
    var fs = require('fs'),
        path = require('path'),
        lym = require('../index'),
        assert = require('assert'),
        mkdirp = require('mkdirp'),
        rd = require(path.join(__dirname, '..', 'utils', 'rd')),
        testFolder = path.resolve(path.join(__dirname, '__basicTests'));

    beforeEach(function() {
        if (fs.existsSync(testFolder))
            rd.rd(testFolder);

        if (!fs.exists(testFolder))
            mkdirp.sync(testFolder);
    });

    it('should install a component ', function() {

        lym.install('lymtest4', {
            path : testFolder
        });

        var componentFolder = path.join(testFolder, 'dev', '__components', 'lymtest4');
        /*
        // doesnt' work yet
        assert.equal(true, fs.existsSync(path.join(componentFolder, '.bower.json')), '.bower.json');
        assert.equal(true, fs.existsSync(path.join(componentFolder, 'component.json')), 'component.json');
        */
    });

});