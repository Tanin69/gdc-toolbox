# gdc-server, an arma 3 community webserver

## Features

## Installation

## Tech notes

### General architecture

This webserver is a **[node.js](https://nodejs.org/) + [Express JS](https://expressjs.com)** app. Express JS greatly simplifies node http server operations.

This app is structured as a Model-View-Controller (MVC) architecture, based on the tutorial found at <https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/Tutorial_local_library_website>, (although I didn't use this tutorial myself). Many many portions of the code snipets are directly taken from the github repo underlying this tutorial (<https://github.com/mdn/express-locallibrary-tutorial/tree/auth>).

Here is a visual representation of the app architecture (from the same source) :

![general application architecture](https://media.prod.mdn.mozit.cloud/attachments/2016/12/06/14456/6a97461a03a5329243b994347c47f12b/MVC%20Express.png "Express MVC architecture")

### Directory structure

    /gdc-server (app root)
        app.js
        package.json
        package-lock.json
        README.md
        /controllers
            ...
        /models
            ...
        /node_modules
            [many modules]
        /public
            /images
            /javascripts
            /style.css
        /routes
            index.js
        /views
            /layouts
                main.hbs
                ...
            error.hbs
            home.hbs
            layout.pug
            ...

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
    minPLayers: {type: Number},
    maxPlayers: {type: Number}
});

module.exports = mongoose.model("Mission", MissionSchema);
```

### Views

Views are generated with [handlebars](https://handlebarsjs.com/) template engine (express flavor).

### Controllers

Controllers are javascript code portions.

### Client side components

"Heavy load" computing, as list management are delegated to a javascript client component : [tabulator](http://tabulator.info/). Tabulator is an open source (MIT licence) javascript library. It is very well maintained, documented and very very powerfull. You should definitly take a look at tabulator !
