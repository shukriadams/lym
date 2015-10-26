/* add own methods to assert*/
module.exports.extend = function(assert){
    assert.hasText = function(text, expected, stripWhiteSpace) {
        if (stripWhiteSpace)
            text = text.replace(/(\r\n|\n|\r| )/g,'');

        var exists = text.indexOf(expected) !== -1;
        assert.equal(exists, true, 'Expected text "' + expected + '" was not found in "' + text + '".');
    };

    return assert;
}