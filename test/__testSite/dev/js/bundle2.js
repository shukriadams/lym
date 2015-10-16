// ==================================================================;
// ==================================================================;
require.config({ paths : {"first":"__components/repo1/first/js/first","second":"__components/repo2/second/second"} });;
// ==================================================================;
require.config({"paths":{"someDependency1":"__components/repo2/second/dependencies/someDependency1","someDependency2":"__components/repo2/second/dependencies/someDependency2"}});

// ==================================================================;
require.config({ baseUrl : '/'});

require(['first'], function(first){

    // first calls second which calls second's dependencies
    first();

});
;
