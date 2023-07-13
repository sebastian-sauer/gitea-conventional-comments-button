# Conventional Comments button

This is a tiny extension that adds a conventional comment button to GitLab file explorer comments, allowing to quickly leave a structured semantic comment during your MR reviews!

## Demo

![Demo](demo.gif)

## How to install

First, clone this repo `git clone git@gitlab.com:conventionalcomments/conventional-comments-button.git` and then see below for browser specific instructions.

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

## How to enable it on a self-hosted instance

- Open the extension options
- Add your domain as a new line in the "Enabled Hosts" field
- Click Save

## Credits

This project bundles some of the icon coming from [font-awesome](https://fontawesome.com/) icons as SVG
