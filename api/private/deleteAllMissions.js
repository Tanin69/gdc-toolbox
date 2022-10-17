const mongoose = require('mongoose');
const dotenv = require("dotenv");
const Mission = require("../models/mission");

//Read environment variables
dotenv.config();

/* Database connection */
console.log("Connecting to database. Please wait...");
mongoose.connect(process.env.DB_CONNECT,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    })
    .then(() => console.log("MongoDB connection success"))
    .then(() => doDelete())
    .catch(() => console.log("MongoDB connection failed !"));

function doDelete() {
    Mission.deleteMany({}, function (err, result) {
        if (err) {
            console.log(err);
        } else {
            console.log(result);
        }
    });
}    
