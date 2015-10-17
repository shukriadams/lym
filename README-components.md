Lym components
===
A Lym component is a folder containing Sass, JS and Handlebars which you write yourself (or
get from someone else), and reuse across projects without having to change the code within. You customize a component's
appearance in a project by using CSS overrides (see [BEM](https://en.bem.info) or [SMACSS](https://smacss.com/)), Sass setting changes at build time, passing different initialization arguments to your Javascripts. All Lym does is provide structure for getting files to your project and compiling them - what you put in your files is up to you.

Folder structure
---
* A component is a folder 
* A component's name is unique. 
* All components must be nested, at any depth, under a single folder which Lym will scan recursively.
* Components can not be nested in other components - the nested ones will be ignored.

Support files
---
* Your component must have a component.json file in it, which must contain at least a "name" attribute which must exactly match the component's folder name. Lym uses this file to identify components.
* Your component can have **bower.json** and **package.json** files for Bower and NPM respectively. These are optional, but must be placed in the component root folder. If present, and you run Lym's "grunt init", all component's bower and npm
  packages will be fetched.
* Your component can have a **make.js** file in its root. If present, this will be executed by NodeJS when your component is installed. Use make.js to set your component up, for example, modifying 3rd party files Bower fetches for your component.
* Your component can contain a **require-config.js** file (nested anywhere) in which you can put any RequireJS setting for that component.

Content files
---
* Components can contain Sass, Javascript and Handlebars files. All are optional.
* You can have one "main" Sass and Javascript file in a component. These must have the same name as the component, and can be nested anywhere within it. Your main Sass file will be automatically compiled, your main Javascript will be automatically available through RequireJS by name. 
* Use your main files to load/link any other component files you need.
* You can organize and nest content files anywhere within the component root.

RequireJS
---
With Lym it's expected that components define and map their own dependencies relative to themselves. Lym will figure out how the parent application finds these files. If your component needs jQuery for example, your component's bower.json file should list jQuery, and pull it down into a bower_component folder within your component folder. Then, you should use RequireJS to map to jquery within your local bower folder.

    require.config({
        paths : {
            'jquery' : 'bower_components/jquery/jquery'     
        }
    });


This of course will not work by default when your site loads, because your website root is not your component folder and RequireJS maps relative to the root. When you build your site Lym modifies the above RequireJS path and maps it to application root.

What happens if two components both want to load jquery? The last component wins. What happens if you have two components which try to load different versions of jquery? Lym does a semantic version comparison at compile time and if there's a major difference in the same dependency, the build will fail.

When you run Lym in "release" mode, all main component javascript files are concatenated into a single file. All dependencies loaded via RequireJS are copied to a central /lib folder in your web root, and all paths passed to Requirejs are remapped automatically.

Why all this remapping and automation? Because loading Javascipt files should be easy. Lym gives you a simple, single, take-it-or-leave-it load model and assumes that you'd rather write cool stuff in your javascript files than worry about how they files are loaded.

Dependencies
---
One of the advantages of creating modular code is combining simple items into more complex ones. In component.json, add module dependencies with

    {
       "name" : "aComplexComponent",
       "dependencies" : {
           "aSimplerComponent" : "0.2.4",
           "someOtherComponent" : "2.1.0"
       }
    }

In the case above, the repositories that contain **aSimplerComponent** and **someOtherComponent** should be registered as Bower components and tagged with the given versions. When you install **aComplexComponent** in your project, the two dependencies will be automatically installed as well.

(Hint : you can create a private Bower registry if you don't want your components on the official Bower list).

Thanks to the tagged linking you can always get the expected dependency code while at the same time being able to modify and extend that code.