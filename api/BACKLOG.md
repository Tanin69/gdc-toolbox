# Backlog

## Planned

### 0.5.0

* Access control

## Not planned

* Replace gameType value with community-specific value
* Extract max nb of players from mission file name (depends on file naming convention)
* Add a DELETE API (maybe a bad idea...)
* Check mission version number during publication process. A mission with an inferior version number than a published one should not be published
* Enhance briefing.sqf analyze
* Better handling of asynchronous save database calls to ensure consistent end-to-end publishing workflow (as of 0.3.0, mission file can be published in missions directory even if the save to the database fails)
* Initialize database with actual list of missions
* Extend database with missions stats, users, maps, etc.
* Standardize syntax and use of callbacks
* Minimal internationalization
* Extract lobby from mission.sqm (and do client rendering) (GL 12)
* Extract players loadouts (and do client rendering) (GL 12)
* Extract strategic view images (Area of Operation) if present in .pbo (and do client rendering) (Warzen)
