# gdc-toolbox, an arma 3 community toolbox

## Overview

gdc-toolbox is a set of tools for arma gamers, mission makers and community managers. From a technical point of view, it is composed of a REST API (gdc-toolbox-api) and a client (gdc-toolbox-client). These two parts are totally independant.

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

Unless explicitly indicated, those features are provided by gdc-toolbox-api.

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

### Briefing extraction (gdc-toolbox-api) and rendering (gdc-toolbox-client)

If a briefing.sqf file is present in the mission pbo, its content is extracted to allow its web rendering

#### Technical details

Briefing is automatically generated from the ```briefing.sqf``` file, by reading its content and computing it with some regex :

```player createDiaryRecord ["Diary", ["Mission", "Notre commando a réussi à s'infiltrer près de l'aérodrome..."]];```

* Where the string ```"Mission"``` is considered as a title
* and ```"Notre commando..."``` as a content. This content is rendered as pure (sanitized) html.

All other strings are ignored.

If a ```loadScreen``` field is found in the mission .pbo and if the referenced image is found, it is used as an illustrative image for the briefing.

For the rendering (gdc-toolbox-client), the briefing is rendered as an html page, using the ```showBriefing.hbs``` view.)

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

### Embed API (gdc-toolbox-client)

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

git clone <https://github.com/Tanin69/gdc-toolbox>

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

### Github repo

<https://github.com/Tanin69/gdc-toolbox>

### Changelog

See /api/CHANGELOG.md and /web-client/CHANGELOG.md

### Future work

See /api/BACKLOG.md and /web-client/CHANGELOG.md

### General architecture

This software is a **[node.js](https://nodejs.org/)** app.

Until v0.3.3, the app was structured as a Model-View-Controller (MVC) architecture and had an underlying (sort of) REST API.

From v0.4.0, a REST API and a frontend client architecture is adopted.

### Client side components

Much of the logic is delegated to javascript client components

* List management : [tabulator](http://tabulator.info/). Tabulator is an open source (MIT licence) javascript library. It is very well maintained, documented and very very powerfull. You should definitly take a look at tabulator !
* File uploads : [dropzoneJS](https://www.dropzonejs.com/)
