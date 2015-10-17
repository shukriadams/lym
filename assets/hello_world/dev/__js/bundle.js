require.config({ baseUrl : '/'});

require(['simpleComponent'], function(component){
    console.log(component());
});