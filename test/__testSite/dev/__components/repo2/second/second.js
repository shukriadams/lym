define('second',['someDependency1'], function(someDependency1){

    return function(){

        var myDiv = document.createElement("div"),
            existing = document.getElementById('second');

        myDiv.innerHTML = '[second-js-output]' + someDependency1;
        existing.parentNode.insertBefore(myDiv,existing.nextSibling);

    };

});

