# Conventional Comments button for gitea

This is a tiny extension that adds conventional comment buttons to gitea pull request comments, allowing to quickly leave a structured semantic comment during your PR reviews in [gitea](https://gitea.io)!

For more information on conventional comments please see [the conventional comments homepage](https://conventionalcomments.org/).

## Demo

![Demo](demo.gif)

## How to install

First, clone this repo `git clone https://github.com/sebastian-sauer/gitea-conventional-comments-button` and then see below for browser specific instructions.

### Chrome

Recently chrome disallowed to install packed `crx` extension that are not listed on the Chrome Store, so to install this

- On Chrome: Menu
  - More Tools
    - Extensions (be sure to have _Developer Mode_ enabled there)
- In the Extension page: `Load unpacked` and select the cloned repository

### Firefox

- On Firefox: enter `about:debugging#/runtime/this-firefox` into the address bar
- In the Extension page: `Load Temporary Add-on...` and select any file within the cloned repository

## How to update

- `git pull`

### Chrome

- On Chrome: Menu
  - More Tools
    - Extensions
- In the Extension page find `conventional comments button` and hit the refresh button

### Firefox

- On Firefox: enter `about:debugging#/runtime/this-firefox` into the address bar
- In the Extension page find `conventional comments button` and hit the reload button

## Supported gitea versions

This extension only works with gitea versions >= 1.23.

## Credits & Attribution

This project was forked from [https://gitlab.com/conventionalcomments/conventional-comments-button](https://gitlab.com/conventionalcomments/conventional-comments-button) to make it usable with gitea.

Please see the LICENSE file for the original license.

This project bundles some icons from [font-awesome](https://fontawesome.com/) as SVG.
