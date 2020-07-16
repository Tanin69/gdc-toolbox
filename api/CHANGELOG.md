# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 0.5.0 - 2020/04/?? (not published)

* Authorization handling via auth0 (what a big piece !). Protected endpoints :
  * /api/mission/add
  * /api/mission/update

## 0.4.0 - 2020-04-24

### Changed

* Finalization of architecture transition. Real RESTful API on the end side and consummer/presentation code completly separed :
  * complete overhaul of the application directory structure
  * Routes adaptation
  * APIs output as JSON everywhere
  * Update API reworked
* As a consequence, from v0.4.0, CHANGELOG.md (this file) and BACKLOG.md are specific for the api and for the client.

### Added

* Test cases for all APIs with Visual Studio Code REST-client
* Implementation of a correct logging system
* New field in the database ```isMissionArchived```. Initialized as true at mission creation. Updatable via update API.
* API documentation

## 0.3.3 - 2020-04-10

### Changed

* App name standardization (repo, footer, etc.)

### Added

* Firsts FAQ entries in README.md
* Default image for briefing rendering and embed integration if image not found or .paa format in mission pbo file
* Embed API for discord embed integration (mix of openGraph, oEmbed and twitter APIs thanks to discord crappy embed implemntation)

### Fixed

* File path bug in bulkImport.js

## 0.3.2 - 2020-04-09

* Few cosmetic optimizations for the list of missions (filters, loading time, etc.)
* Better responsivness for home page

## 0.3.1 - 2020-04-07

### Changed

* Cleaned and standardized all web pages
* Made a decent home page

## 0.3.0 - 2020-04-06

### Added

* briefing.sqf recursive search
* IFA3 mod detection
* new route and controller to update database (updateController.js)
* New control for mission publication : mission.sqm is not binarized (default: non blocking error)
* New control for mission publication : HC_Slot is present (default: non blocking error). Will always fail if mission.sqm is binarized.
* Bulk mission publishing : checks, analyzes and publishes all missions from a directory. Server-side CLI only.
* Delete all missions : delete all mission documents in the database. Server-side CLI only.
* Labels in JSON object and database for each field to have human readable text. Used on client side to display results during publication workflow
* Warning in mission publication panel if mission.sqm is binarized

### Changed

* Huge code refactoring to kill last database update from client side data
* Mission schema deeply restructured
* Extracted add mission (to database) code from controller (addMission.js common function created)
* Better handling for results rendering on the client side, now independent of the number of JSON fields returned from server response
* Searching for description.ext and briefing.sqf files is no longer case-sensitive (checkMission.js and grabMission.js)

### Removed

* File extension control : useless because included in naming convention control

## 0.2.0 - 2020-03-28

### Changed

* Major code refactoring. The previous version was mainly a proof of concept. The code handling mission functions was monolithic. This code has been split into unitary functions. Mainly :
  * Mission checking code
  * Mission information gathering code

### Added

* Mission checking rules are configurable by passing a JSON object as second optionnal parameter in the checkMission function call.

## 0.1.1 - 2020-03-24

### Changed

* briefing html code sanitization

## 0.1.0 - 2020-03-23

### Added

* Application general architecture (MVC model) with all components (directory and files structure, utilitary files like .env, README.md, CHANGELOG.md, etc.)
* Main html views : home page, mission publication, mission briefing and list of the missions
* First worflow : publish a mission -> save in database and update list -> consult the list -> open a mission briefing
