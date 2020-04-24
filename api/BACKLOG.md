# Backlog

## Planned

### 0.4.0

* Restructure API to be RESTful : route names, parameters, entries (calls from client) and returns
* Make a decent error handling
* Clean all console.log code entries

## Not planned

* Regroup mission management in a unique controller (as of 0.3.0, there are 5 controllers, one for each CRUD operation) to keep the univocity controller -> model and to prepare the arrival of future models (map, user, stats, etc.)* Replace gameType value with community-specific value
* Extract max nb of players from mission file name (depends on file naming convention)
* Add a DELETE API
* Check mission version number during publication process. A mission with an inferior version number than a published one should not be published
* Enhance briefing.sqf analyze
* Better handling of asynchronous save database calls to ensure consistent end-to-end publishing workflow (as of 0.3.0, mission file can be published in missions directory even if the save to the database fails)
* Initialize database with actual list of missions
* Extend database with missions stats, users, maps, etc.
* Implement minimal access control
* Standardize syntax and use of callbacks
* Minimal internationalization
* Extract lobby from mission.sqm
* Extract loadouts
