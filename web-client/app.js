// External modules imports
const express = require('express');
const exphbs  = require('express-handlebars');
const path = require('path');
const favicon = require('serve-favicon');
const dotenv = require('dotenv');
const pjson = require('./package.json');

// Read environment variables
dotenv.config();

// App specific imports
const routes = require("./routes");

/* Express app instanciation */

const app = express();

/* Express middlewares */

app.use(express.json());

/* View engine instanciation and configuration */

// express-handlerbars instanciation
const hbs = exphbs.create({
     extname: ".hbs",
     partialsDir: __dirname + "/views/partials/",
});

// Inform express about template engine to use
app.engine(".hbs", hbs.engine);
app.set('view engine', '.hbs');

// Static assets
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public/img', 'favicon.ico')));

// Connect all routes to application
app.use ("/", routes);


/* Global error handling */

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
  
// Error handler
app.use(function(err, req, res, next) {
    //Send error message
    res.status(err.status || 500).json({ "Error": err.message });
});

// Launch the server app
try {
    app.listen(process.env.PORT);
    console.log(`${pjson.name}-${pjson.version} listening on port ${process.env.PORT}`);
    console.log(`see ${pjson.repository.url} (author(s): ${pjson.author})`);
}
catch (e) {
    console.error(e);
}

module.exports = app;
