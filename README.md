Lym is a build script for modular frontend end code, implemtend in NodeJS. It uses Assemble (markup), RequireJS (Javascript), Sass (CSS) and some internal Grunt helpers.


Use Lym to structure your frontend code into folder-based components that do not require any knowledge of each other.
Lym detects, compiles and "links" your Sass, Handlebar and Javascript dynamically - no module configuration is
necessary. If you want one component's Sass to use a mixin, function or variable in another,
a simple dependency link ensures the dependent component is compiled first.

Lym supports semantic version coupling between dependent components.

Lym supports 3rd party Javascript dependencies within any component with Bower and RequireJS.

**Getting started**
-------------------
- install Lym with "npm install -g lym"
- put your Assemble pages, layouts in /myApp/assemble/...
- create a component folder /myApp/dev/__components/myComponent
- a component needs a manifest file - create /myApp/dev/__components/myComponent/component.json, with the contents

  { "version" : "0.0.1" }

- add a sass file /myApp/dev/__components/myComponent/myComponent.sass
- run "lym dev" in your /myApp folder to build your set in dev mode.
- serve the contents of /dev with whatever web server you prefer.

**Demo**
--------
Simple website built on Lym : https://github.com/shukriadams/lym-demo-basic


**Configuration**
-----------------
Lym separates configuration from function. Any changes you make to Lym can be placed outside the /lym folder in /work/lym.json as overrides.
In this way Lym can destructively update itself within its own folder, without touching your work.


**Components**
--------------
- A component lives in its own folder, and shouldn't have components nested underneath it.
- A component name is the same as its folder name.
- A component name must be unique within a given project.
- A component must contain a component.json file, which must contain the component's version number, and an optional declaration of other components
this component requires.

    {
        "version": "0.0.1",
        "dependencies : {
            "some-other-component" : "0.0.2",
            "yet-another-component" : "0.1.3"
        }
    }

- You can add Sass and Javascript files to a plugin. These files must also have the same name as the component, and therefore the root folder of the component.
- Any number of additional files and folders can be added to a component if required.
- In theory, each component can live in its own repository, branches with different version numbers set up in a single repostory, and a specific branch cloned
into the /work/stage/__components folder, allowing version-based component coupling.


**Run**
----------------
Run "grunt" or "grunt dev" to build the site to /work/stage, for development and debugging purposes. Javascript files are not concatenated, so you can debug in your
components' source JS files.

Run "grunt release" to build the site to /release. This takes longer, and all component javascripts are collected and concatenated.


