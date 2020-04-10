# gdc-toolbox, an arma 3 community toolbox

## Table of contents

* [Intented audience](#intented-audience)
* [Features](#features)
* [Installation](#installation)
* [Frenquently asked questions](#frequently-asked-questions)
* [Tech notes](#tech-notes)

## Intented audience

This software is intended for players, mission creators and administrators of Arma 3 communities.

Arma 3 is a military simulation video game created and edited by Bohemia Interactive Studios.

## Features

### Mission checking

Checks the integrity of the mission .pbo file and compliance with certain rules. Each rule can be configured as blocking if it is not satisfied :
  
* file naming convention : the file name should follow a defined regexp (default: true)
* pbo integrity : the file should be a real pbo and could be dpbo without any error (default: true)
* briefing.sqf : a briefing.sqf should exist in the pbo file (default: true)
* mission.sqm : a mission.sqm should exist in the pbo file (default: true)
* description.ext : a description.ext should exist in the pbo file (default: false)
* Headless Client : a headless client named HC_Slot (case sensitive) should exist in mission.sqm, it should me declared as isPlayable=1 and should be type="HeadlessClient_F" (default: true) -> should match regex as ```.*name="HC_Slot";\s*isPlayable=1;[^type="HeadlessClient_F";]```
* mission.sqm is not binarized : (default: false). Be careful, if the mission.sqm is binarized, HC control and author detection will fail

### Informations gathering about mission

By reading the different files contained in the pbo, by the name of the pbo file and other means, retrieves a maximum of information on the mission.

* missionPbo: pbo file name
* pboFileSize: pbo file size
* pboFileDateM: pbo publication date
* owner: mission owner (not implemented yet : "admin" for every mission)
* missionTitle: mission title. Extracted from mission file name
* missionIsPlayable: mission playabilty status (editable)
* missionVersion: mission version number. Extracted from mission file name
* missionMap: Arma map used by mission. Extracted from mission file name
* author: mission author. Extracted from description.ext, or from mission.sqm if not found in description.ext
* onLoadName: text that appears above the image during mission loading screen. Extracted from description.ext, or from mission.sqm if not found in deccription.ext
* onLoadMission: text that appears under the image during mission loading screen. Extracted from description.ext, or from mission.sqm if not found in deccription.ext
* overviewText: text that appears on the mission choice screen or in the lobby screen. Extracted from description.ext, or from mission.sqm if not found in deccription.ext
* gameType: the type of game (Coop, TVT, etc.). Extracted from description.ext, or from mission.sqm if not found in description.ext
* minPlayers: Minimum number of players as determined by the mission maker. Extracted from description.ext, or from mission.sqm if not found in description.ext
* maxPlayers: Maximum number of players as determined by the mission maker. Extracted from description.ext, or from mission.sqm if not found in description.ext
* missionBriefing: briefing content, extracted from a briefing.sqf file if this file exists in the mission pbo
* loadScreen: image file, if this file exists in the mission pbo file. Extracted from description.ext, or from mission.sqm if not found in deccription.ext. If declared but not found, the field is declared with "image referenced in loadScreen, but image file not found in the pbo !".

### Briefing extraction and rendering

If a briefing.sqf file is present in the mission pbo, its content is extracted to allow its web rendering

#### Technical details

The briefing is rendered as an html page, using the ```showBriefing.hbs``` view.

Briefing is automatically generated from the ```briefing.sqf``` file, by reading its content and computing it with some regex :

```player createDiaryRecord ["Diary", ["Mission", "Notre commando a réussi à s'infiltrer près de l'aérodrome..."]];```

* Where the string ```"Mission"``` is considered as a title
* and ```"Notre commando..."``` as a content. This content is rendered as pure (sanitized) html.

All other strings are ignored.

If a ```loadScreen``` field is found in the mission .pbo and if the referenced image is found, it is used as an illustrative image for the briefing.

### Mission publication

Allows mission makers to publish their mission pbo to a directory located on the server, as defined by admin. Before publication, mission pbo is checked. If check is sucessfull, informations about the mission are grabbed and added to a database.

### List of missions

Allows players to access the list of missions. The list :

* allows to render mission briefing as an html page, if the briefing had successfully been extracted from the mission pbo file (see above)
* allows to edit ```missionIsPlayable``` field (true or false)
* is sortable
* can be filtered

Moreover :

* user can change column width and/or order
* the configuration of the list is locally saved (column order, height, sort, etc)

### Embed API

Embed API is used, notably for discord embed

## Installation

### First installation

#### Download and install Mikero tools on your server

[Mikero tools](https://mikero.bytex.digital/Downloads).

At least :

* ExtractPbo
* DeOgg
* (maybe) DePbo

#### Download and install node

[node](https://nodejs.org/)

#### Clone git repository

git clone <https://github.com/Tanin69/gdc-server>

#### Install modules

In the server directory, run ```npm install```

#### Define environment variables

* Copy ```.sample-env``` to ```.env```
* Edit path with your configuration

## Frequently Asked Questions

### Publishing a mission

#### I can not validate my mission. gdc-toolbox keeps telling me "blabla"

Your mission must have been tested with success in arma 3 ! gdc-toolbox IS NOT a mission validator.

#### Why does my image not appear in the briefing

gdc-toolbox look for a "loadScreen" string in description.ext *and* mission.sqm files. It might fail mostly because of :

* missing semi-column at the end of loadScreen field in description.ext file AND no loadScreen value missing in mission.sqm. In description.ext file, this line must be as ```loadSreen = "<yourimage.jpg>";``` <- note the ending semi column
* wrong path or file name in description.ext or mission.sqm (Eden generated)
* Image file format .paa
* missing image file in pbo
If your image file does not appear and your are not in one of the cases mentioned, please report a bug

#### Author name and/or HC_Slot not found although declared/created in Eden editor

Your mission.sqm is probably binarized. gdc-toolbox can not find these two informations if the mission.sqm file is binarized. Solution : don't binarize your mission.sqm file or create a description.ext with the correct informations.

#### I entered "blabla" in the Eden loadName/loadScreen/etc mission attribute, but this is not what appears in gdc-toolbox

gdc-toolbox takes at first informations grabbed from description.ext file. In Arma, these informations take precedence over mission.sqm informations. So does gdc-toolbox. Check your mission folder and look for a description.ext file.

## Tech notes

### Changelog

See CHANGELOG.md

### Future work

See BACKLOG.md

### General architecture

This webserver is a **[node.js](https://nodejs.org/) + [Express JS](https://expressjs.com)** app.

This app is structured as a Model-View-Controller (MVC) architecture, based on the tutorial found at <https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/Tutorial_local_library_website>, (although I didn't use this tutorial myself). Many many portions of the code snipets are directly taken from the github repo underlying this tutorial (<https://github.com/mdn/express-locallibrary-tutorial/tree/auth>). It has an underlying (sort of) REST API.

Here is a visual representation of the app architecture (from the same source) :

![general application architecture](https://media.prod.mdn.mozit.cloud/attachments/2016/12/06/14456/6a97461a03a5329243b994347c47f12b/MVC%20Express.png "Express MVC architecture")

### Directory structure

```code
/gdc-toolbox (app root)
    app.js
    README.md
    CHANGELOG.md
    BACKLOG.md
    ...
    /controllers
    /models
    /node_modules
        [many modules]
    /public
        /css
        /img
        /javascript
    /private
    /routes
        index.js
    /views
        /layouts
        /partials
        ...
```

#### Client side

All client logic should be under /public and /views directories

#### /private directory

/private directory contains scripts that can be executed on server side via node on CLI.

### Models and database

Models and database use [mongoDB](https://www.mongodb.com/) through [Mongoose](https://mongoosejs.com/) node module.

Models are a representation of database objects, called ```Schema``` in the mongoose universe. For example, the mission model looks like :

```javascript
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const MissionSchema = new Schema({
    missionTitle: {type: String, required: true},
    missionVersion: {type: String},
    missionMap: {type: String},
    missionPbo: {type: String},
    pboFileSize: {type: Number},
    pboFileDateM: {type: String},
    author: {type: String},
    onLoadName: {type: String},
    onLoadMission: {type: String},
    gameType: {type: String},
    minPlayers: {type: Number},
    maxPlayers: {type: Number}
});

module.exports = mongoose.model("Mission", MissionSchema);
```

### Views

Views are generated with [handlebars](https://handlebarsjs.com/) template engine (express flavor).

### Controllers

Coontrollers are portions of code that manage business logic.

### Client side components

Much of the logic is delegated to  javascript client components

* List management : [tabulator](http://tabulator.info/). Tabulator is an open source (MIT licence) javascript library. It is very well maintained, documented and very very powerfull. You should definitly take a look at tabulator !
* File uploads : [dropzoneJS](https://www.dropzonejs.com/)
