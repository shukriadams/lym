require.config({ baseUrl : '/'});

require(['first'], function(first){

    // first calls second which calls second's dependencies
    first();

});
