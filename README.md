**Lym**
======
Lym is a builder/compiler for modular frontend end code, implemtend in NodeJS. It uses **[Assemble](htto://assemble.io)** (markup), **[RequireJS](http://requirejs.org)** (Javascript), and **[Sass](http://sass-lang.com)** (CSS) for content. Components are managed as standard **[Bower](http://bower.io)** packages.

With Lym you can structure your frontend code into clearly-separated folder components. A component can contain any number of Handlebar templates, Sass and Javascript files. Main component files are automatically Sass compiled and RequireJS linked. Put each component in its own repository as a Bower package, and easily consume it. Create complex components that reuse content in other components, all with semantic version dependency linking.
Getting started
-------------------
- install Lym with **npm install -g lym**.
- if you've already published a component package on Bower, fetch it with **lym install SomeComponentName**.
- run "**lym dev**" to build in dev mode (faster building, no script concatenation etc), or **lym release** for the full treatment.
- serve your markup with a web server of your choice.
Configuration
----------------
Lym settings can be overridden with a **lym.json** file in your project root folder. You can also pass your config json to Lym as a command line argument **--config {your json here}**.
Create a component
------------------------
coming soon



