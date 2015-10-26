/*
 * Mock of core lym.js file for testing.
 *
 * */

'use strict';

var args = null;

/*
 *
 * */
module.exports.getArgs = function(){
    return args;
};


/*
 * Installs a component.
 * */
module.exports.install = function(component, options){
    args = arguments;
};


/*
 * Scaffolds a website from the given 'content' folder in /assets
 * */
module.exports.scaffold = function(content , options){
    args = arguments;
};


/*
 *
 * */
module.exports.init = function(component, options){
    args = arguments;
};


/*
 *
 * */
module.exports.build = function(options){
    args = arguments;
};


/*
 *
 * */
module.exports.release = function(options){
    args = arguments;
};


/*
 *
 * */
module.exports.fast = function(options){
    args = arguments;
};


/*
 *
 * */
module.exports.watch = function(options){
    args = arguments;
};