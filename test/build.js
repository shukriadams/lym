/*
* build tests -
* - lym build
* - lym release
* */
'use strict';

var assert = require("assert"),
	grunt = require("grunt"),
    connect = require('connect'),
    fs = require('fs'),
    serveStatic = require('serve-static'),
    Browser = require('zombie'),
    mkdirp = require('mkdirp'),
    sync = require('child_process').execSync,
    path = require('path');

var testSite = path.join(__dirname, '__testSite'),
    devRoot = path.join(testSite, 'dev'),
    releaseRoot = path.join(testSite, 'release');

// scaffold test site
sync('node lym scaffold internal_dev --nomake --p ' + testSite, { cwd : path.join(__dirname, '..'), stdio:[0,1,2] });

if (!fs.existsSync(releaseRoot))
    mkdirp.sync(releaseRoot);

// set up servers for dev and release content
connect().use(serveStatic(devRoot)).listen(8081);
connect().use(serveStatic(releaseRoot)).listen(8082);


Browser.Assert.prototype.hasText = function(selector, expected, stripWhiteSpace) {
    var element = this.browser.query(selector);
    if (element.length)
        element = element[0];
    var text = element.innerHTML;

    if (stripWhiteSpace)
        text = text.replace(/(\r\n|\n|\r| )/g,'');

    var exists = text.indexOf(expected) !== -1;
    assert.equal(exists, true, ' actual text : ' + text );
};



runTests('8081', function(){
    sync('node lym build --p ' + testSite, { cwd : path.join(__dirname, '..'), stdio:[0,1,2] });
});


runTests('8082', function(){
    sync('node lym release --p ' + testSite, { cwd : path.join(__dirname, '..'), stdio:[0,1,2] });
});



/*
*
* First wave of tests (aka the bare minimum) :
* This very rough test assumes that Lym's basic functionality is intact if all expected markup,
* css and javascript-generated content is available in the browser.
*
* More detailed tests can be added later.
* Todo :
* Test specific features of lym
* Test order of css rules, not just presence.
*
* * */
function runTests (port, build){

    describe('build tests', function() {
        this.timeout(20000);

        build();

        var browser = new Browser();

        before(function(d) {
            browser.visit('http://localhost:' + port, d);
        });


        // layout
        it('should show layout hbs content', function() {
            browser.assert.hasText('.layout', '[defaultLayout-hbs-output]');
        });



        // page
        it('should show index page hbs content', function() {
            browser.assert.hasText('.page', '[indexPage-hbs-output]');
        });



        // partial
        it('should show partial hbs content', function() {
            browser.assert.hasText('.partial', '[partial-hbs-output]');
        });

        it('should show partial json content', function() {
            browser.assert.hasText('.partial', '[partial-json-output]');
        });



        // first
        it('should show first hbs content', function() {
            browser.assert.hasText('.first', '[first-hbs-output]');
        });

        it('should show first js content', function() {
            browser.assert.hasText('.first', '[first-js-output]');
        });

        it('should show first json content', function() {
            browser.assert.hasText('.first', '[first-json-output]');
        });



        // second
        it('should show second hbs content', function() {
            browser.assert.hasText('.second', '[second-hbs-output]');
        });

        it('should show second js content', function() {
            browser.assert.hasText('.second', '[second-js-output]');
        });

        it('should show second dependency1 js content', function() {
            browser.assert.hasText('.second', '[someDependency1-js-output]');
        });

        it('should show second dependency2 js content', function() {
            browser.assert.hasText('.second', '[someDependency2-js-output]');
        });



        var lymCssBrowser = new Browser();

        before(function(d) {
            lymCssBrowser.visit('http://localhost:' + port+ '/css/lym.css', d);
        });

        it('should show first-settings css', function() {
            lymCssBrowser.assert.hasText('body', '.first-setting{color:red;}',true);
        });

        it('should show first-mixin css', function() {
            lymCssBrowser.assert.hasText('body', '.first-mixins{color:red;}',true);
        });

        it('should show second-mixin css', function() {
            lymCssBrowser.assert.hasText('body', '.second-mixins{color:orange;}',true);
        });

        it('should show second css', function() {
            lymCssBrowser.assert.hasText('body', '.second{color:green;}',true);
        });


        var firstBundleCssBrowser = new Browser();

        before(function(d) {
            firstBundleCssBrowser.visit('http://localhost:' + port+ '/css/first-bundle.css', d);
        });

        it('should show first css', function() {
            firstBundleCssBrowser.assert.hasText('body', '.first{color:red;}',true);
        });
    });
}
