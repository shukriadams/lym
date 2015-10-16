// ==================================================================;
// ==================================================================;
require.config({ paths : {"first":"js/componentBundle","second":"js/componentBundle","repo3":"js/componentBundle"} });;
// ==================================================================;
require.config({"paths":{"someDependency1":"lib/someDependency1","someDependency2":"lib/someDependency2"}});

// ==================================================================;
require.config({ baseUrl : '/'});

require(['first'], function(first){

    // first calls second which calls second's dependencies
    first();

});
;
