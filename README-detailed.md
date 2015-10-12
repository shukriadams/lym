Lym
====

How it works
------------
Lym is a kind of preprocessor/linker/compiler for modular frontend code. It does a lot of the tedious and boring work
of compiling and linking Sass, Javascript and Handlebar templates. If you structure your code into folder-modules, Lym
will automatically detect and compile these components for you.


Config
------
Lym's default configuration is stored in /lym.json. Under normal use you wouldn't change this file, but pass
overrides to Lym that overwrite the default config values at runtime. You don't have to pass anything - Lym works out
 of the box, though you have to put content where it expects to find it by default.

**Override by Grunt**

Call Lym's grunt with the argument --config YOUR-JSON-STRING to override it.

Passing the same json structure as that in lym.json will override that file's structure at execution. For example,
the default structure is

    {
      "lymConfig" : {
        "componentFolder" : "../dev/__components"
        ...
       }
    } 

if you pass the following json string to grunt 

    {
      "lymConfig" : {
        "componentFolder" : "../myDev/__components"
        ...
       }
    } 

the path where Lym looks for components can be changed. You can easily all Lym's grunt from another Grunt file using
https://www.npmjs.com/package/grunt-hub.

**Override by file**

If you want to start Lym Grunt directly from the command line, you can pass config overrides to it by copying
lym.json to the parent folder of /lym, and putting your overrides in there. For example,

    {
        "name": "My site",
        "dependencies": {
            "myComponent": "https://git.repo/me/mycomponent.git#v0.0.3"
        },  
    }

Would pull v.0.0.3 of myComponent. If you have another component, myOtherComponent, that depends on myComponent v0.0.3,
add the following to its component.json file.

    {
        "name" : "myOtherComponent",
        "dependencies" : {
            "myComponent" : "0.0.3"
        }
    }


Self-contained components
-------------------------
With Lym it's expected that components define and map their own dependencies relative to themselves. Lym will figure
out how the parent application loads the application. If your component needs jQuery for example, your component's
bower.json file should list jQuery, and pull it down into a bower components folder within your component folder. Then,
you should use RequireJS to define and map to jquery within your local bower folder. This of course will not work by
default when you load your script, because your website root is likely not your component folder. So how does requirejs
get the correct path to your component's jquery? Normally you'd set up a requirejs config with
    
    require.config({
        paths : {
            'jquery' : 'bower_components/jquery/jquery'     
        }
    });

But with Lym you use

    lym.config({
        paths : {
            'jquery' : 'bower_components/jquery/jquery'    
        }
    });

Everything you pass to this will get passed on to Requirejs, including shims and the rest. By the time it reaches
Requirejs it will have the correct path relative to the web root.

What happens if two components both want to load jquery? The last component wins. What happens if you have two
components which try to load different versions of jquery? Lym does a semantic version comparison at compile time and
if there's a major difference in the same dependency, the build will fail.

When you run Lym in "release" mode, all main component javascript files are concatenated into a single file. All
dependencies loaded via RequireJS are copied to a central /lib folder in your web root, and all paths passed to
Requirejs are remapped automatically.

Why all this remapping and automation? Because loading Javascipt files should be easy. Lym gives you a simple, single,
take-it-or-leave-it load model and assumes that you'd rather write cool stuff in your javascript files than worry about
how they're loaded.


Component structure
-------------------
Components are the reason Lym exists. A component is a folder of Sass, JS and Handlebars which you write yourself (or
get from someone else), and reuse across projects without having to change the code within. You customize a component's
appearance in a project by CSS overrides, Sass setting changes, and passing different initialization arguments to your
Javascripts. How you do that is your own business - Lym just makes sure everything is compiled, hooked up and running
in your browser.

Component file system rules : 
* A component is a folder 
* A component's name is unique. 
* All components must be nested, at any depth, under a single folder which Lym will scan recursively.
* Components can not be nested in other components - the nested ones will be ignored.

Component support files :
* Your component must have a component.json file in it, which must contain at least a "name" attribute which must
  exactly match the component's folder name
* Your component can have bower.json and package.json files for Bower and NPM respectively. These are optional, but must
  be placed in the component root folder. If present, and you run Lym's "grunt init", all component's bower and npm
  packages will be fetched.
* Your component can have a make.js file in its root. If present, this will be executed with NodeJS when your run "Grunt
  init". Use make.js to set your component folder up if necssary, for example, modifying 3rd party files Bower fetches
  for your component.

Component content files :
* Components can contain Sass, Javascript and Handlebars files. All are optional.
* Your "main" Sass and Javascript file for a given component must have the component's name. This is used by Lym to
  automatically wire them up, either for Sass compilation, or RequireJS linking. From your main files you can include or
  require as many sub-files as you wish, but you should always start with a main file.
* You can organize and nest your files anywhere within the component root.


Versioning
----------
Components wouldn't be very useful if you couldn't improve on or add to them. But as you change a component, other
components or projects that depend on it could break. Lym uses http://bower.io to control dependency linking. Add a
bower.json to your component root and make sure you import your components into your project's component folder with a
Bower tag link. That way any project would always be able to find the component version that works for it, even if the 
component has changed. 
