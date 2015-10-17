define('first',['second'], function(second){

    return function(){
        var myDiv = document.createElement("div"),
            existing = document.getElementById('first');

        myDiv.innerHTML = '[first-js-output]';
        existing.parentNode.insertBefore(myDiv,existing.nextSibling);

        // first calls second
        second();
    };

});