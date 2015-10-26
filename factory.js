'use strict';

exports.require = function(name, factory){
    if (factory && typeof factory === 'string' && factory.index(name) === 0)
        return require(factory.subStr(name.length));
    return require(name);
};
