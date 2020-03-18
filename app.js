// External modules imports
const express = require('express');
const exphbs  = require('express-handlebars');
const path = require('path');
const favicon = require('serve-favicon');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Read environment variables
dotenv.config();

// App specific imports
const routes = require("./routes");

/* Express app instanciation */

const app = express();

/* Express middlewares */

app.use(express.json());

/* Database connection */

mongoose.connect("mongodb+srv://tanin69:CleDaLu69@cluster0-chdbc.mongodb.net/gdc?retryWrites=true&w=majority",
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('MongoDB connection success'))
  .catch(() => console.log('MongoDB connection failed !'));

/* View engine instanciation and configuration */

// express-handlerbars instanciation
const hbs = exphbs.create({
     extname: ".hbs",
     partialsDir: __dirname + '/views/partials/'
});

// Inform express about template engine to use
app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');

// Connect all routes to application
app.use ("/", routes);

// Static assets
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public/img', 'favicon.ico')));

/* Global error handling */

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
  
// Error handler
app.use(function(err, req, res, next) {
    // Set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // Render the error page
    res.status(err.status || 500);
    res.render("error", {appErrMsg: err.status +": " + err.message});
});

// Launch the server app
try {
    app.listen(process.env.PORT);
    console.log(`${process.env.APP_NAME} listening on port ${process.env.PORT}`);
}
catch (e) {
    console.error(e);
}

module.exports = app;
