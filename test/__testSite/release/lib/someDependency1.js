define('someDependency1', ['someDependency2'], function(someDependency2){
    return '[someDependency1-js-output]' + someDependency2;
});