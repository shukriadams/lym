**Lym**
===
Lym is a builder/compiler for static, modular frontend code. It is implemented in NodeJS. It uses **[Assemble](http://assemble.io)** (markup), **[RequireJS](http://requirejs.org)** (Javascript), and **[Sass](http://sass-lang.com)** (CSS). Components are managed as **[Bower](http://bower.io)** packages.

Why static frontend? That discussion is too long for this readme, but you can try this [Smashing Magazine](https://www.smashingmagazine.com/2015/11/modern-static-website-generators-next-big-thing) article for a quick introduction. There's also this [demo site](http://me.manafeed.com/lym.html) built with Lym.

With Lym you can structure your frontend code into clearly-separated folder components. A component can contain Handlebar templates, Sass and Javascript files. Main component files are automatically Sass compiled and RequireJS linked. Put each component in its own repository as a Bower package, and easily use it across multiple projects. Create complex components that reuse content in other components, all with semantic version dependency linking.

Getting started
---
- install Lym with **npm install -g lym**.
- in any folder, run **lym scaffold** to set up a basic site. This isn't a requirement but it's handy to get quickly started.
- run **lym build** to compile your set in dev mode (faster building, no script concatenation etc), or **lym release** for the full treatment.
- serve your markup with a web server of your choice from /dev or /release.
- Lym has no runtime dependencies other than NodeJS (it has been tested on 0.12) and Git.

Add components
---
- if you've already published a Lym-compatible component on Bower, fetch it with **lym install yourComponentName**.

Create components
---
[Component structure](README-components.md).

Configuration
---
All editable settings in Lym are listed in **[lym.json](https://github.com/shukriadams/lym/blob/master/lym.json)**. You can override any value by adding a lym.json file with the same structure to your project root folder. You need only include the values you want to override.

If you want to pass settings to Lym at runtime instead of by file, you can pass your config json to Lym as a command line argument **--config {your json here}**.
