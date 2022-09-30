# Calendar Wizard
Created by Aaron Cohen - September 2022

## About
This browser extension provides easy synchronization capabilities between enrolled events and personal calendars. 

## Usage
Right click on a home page and expand the `Calendar Wizard` submenu to select an option. The list of currently known / supported home pages can be found in `src/background/constants.js`.

## Features
- Sync enrolled events to Google Calendar automatically
- Show potential scheduling conflicts directly on an event page
- Download `.ics` universal calendar file with enrolled events for use in other calendar applications

## Build Information
Run the build script with `npm run build`. You will need to select a manifest file to use, depending on your web browser. Chrome uses Manifest V3 while Firefox only supports Manifest V2. You will need to rename the respective manifest file included here to be exactly `manifest.json`. Minification can be toggled in the `webpack.config.js` file.

## Contribute
If you would like to contribute ideas or feedback, please create a discussion post in this repository.

If you would like to contribute code, please create a pull request. More information on how to do this can be found [here](https://github.com/MarcDiethelm/contributing/blob/master/README.md)

## Licensing
*Disclaimer: Calendar Wizard is completely and entirely unaffiliated with RecHub, Pinfire Labs, the University of Wisconsin Hoofers, the Wisconsin Union, Google, or Google Calendar.*

The Calendar Wizard extension was devloped independently by Aaron Cohen + any contributors listed in the git history on Github. While the source code is available for public viewing, it is not a true 'open source' application. Please contact [Aaron Cohen](mailto:aaron.cohen241@gmail.com) for more licensing information if you would like to use the source code or algorithms shown here in your own application. All rights reserved.