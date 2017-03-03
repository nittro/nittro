Nittro
======

Nittro is a javascript client-side framework and library specifically designed to be used with the [Nette framework](https://nette.org).
It makes your page fully AJAX-driven, taking care of basic things such as applying snippets to the page, updating the
browser history, displaying transition animations while content is being loaded, client-side form validation, AJAX
uploads, flash messages and more. The basics are pretty easy to set up and there are no outside dependencies (no jQuery
for example).

The documentation is [right this way](https://github.com/nittro/nittro/wiki).

You can get a pre-built Nittro package from the [website](https://www.nittro.org/download) or using Bower
(`bower install --save nittro-essentials` or `bower install --save nittro-full`) or you can get the source packages
from NPM (`npm install --save nittro` and optionally `nittro-extras`) and build it yourself using 
the [Gulp](https://github.com/nittro/gulp) or [Grunt](https://github.com/nittro/grunt) plugin.


## Roadmap

### v2.1

After completing the Cookbook and updating the documentation, these are the plans we have for Nittro:

* **Bootstrap bridge** - We'd like to have a package which will make Nittro integrate nicely with Twitter Bootstrap.
* **Better live form validation** - Current live form validation works a bit naively every time the blur event occurs
  on a field. We'd like to come up with a smarter approach.
* **AJAX form validation** - Much as you can opt-in to live form validation we'd like to give you the ability to
  validate the form or selected fields using AJAX to facilitate validation which can only happen on the server side,
  like unique user name in a registration form.
* **Update NEON implementation** - This is more of an internal project, but Nittro's port of the NEON encoder
  and decoder is based on an old version of its Nette counterpart. We'd like to bring it up to date.
* **Build the DI Container on the server** - Currently the DI Container is being built in the browser on every request;
  we'd like to extract that part of the bootstrap process to the Nittro Builder to shave off some bytes off the Nittro
  packages and ever-so-slightly speed up Nittro's startup.
* **Support Nextras/Datagrid** - We'd like to build a package you can add to your builds to make Nittro integrate
  better with the Nextras/Datagrid component.
* **Dynamic forms** - We're thinking about client-side support for generating dynamic form components like you can do
  with Kdyby/Replicator and similar tools.

**Is this list complete?** Hell no. I'm sure we'll come up with a lot of other ideas before the time for 2.1 comes
around. You are more than welcome to suggest ideas of your own - simply shoot us an email at nittro@nittro.org or
post it in the Issue tracker.


## We're hiring!

I'm kidding, obviously. There's no money to be made developing a library targeted at a community counting in the tens.
But if you _are_ interested in contributing to Nittro, know that any form of contribution is much appreciated - be it
a bug report, a pull request or even a component of your own. Please get in touch (again via nittro@nittro.org) and
we'll work something out.
