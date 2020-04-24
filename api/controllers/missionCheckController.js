/**
 * Checks a mission pbo before it can be published
 * 
 * @name /api/mission/check
 * 
 * @example <caption>Same as /api/mission/add route. Change the api endpoint to /api/mission/check</caption>
 * 
 * @path {POST} /api/mission/check
 * @header {String} Accept application/json
 * @header {String} Content-Type multipart/form-data
 * @body {formData} form - an html form containing the mission pbo file to be checked
 * @response {JSON} Success full mission json 
 * @response {JSON} Failed result of the check
 * @response {JSON} Error error message from server
 * @code {200} Success: the mission is valid, ready to publish
 * @code {202} Failed: the check reported an error
 * @code {400} Error: bad request (file size exceeded, incomplete forme, etc.)
 */

//External module imports
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const { IncomingForm } = require('formidable');

//App module imports
const checkM = require("../common/checkMission");
const grabM = require("../common/grabMissionInfos");

//LOG prefix
const moduleName = path.basename(__filename);
const LOG_PREF = `${moduleName}->`;

//Reads environment variables
dotenv.config();

exports.checkMission = function(req, res) {

    const form = new IncomingForm({maxFileSize: 10 * 1024 * 1024});
    
    form.parse(req);

    form.on("fileBegin", (name, file) => {
        console.info(`${LOG_PREF} ${file.name} : début de réception du fichier`);
        file.path = process.env.UPLOAD_DIR + file.name;
    });
    
    form.on("file", (name, file) => {

        const pboFileName = process.env.UPLOAD_DIR + file.name;
        console.log(`${LOG_PREF} ${file.name} : taille du fichier reçu: ${file.size}`);
        
        //Checks if the mission pbo was previously published. If yes, we launch a 202 http code and return a well formed JSON.
        if (fs.existsSync(process.env.MISSIONS_DIR + file.name)){
            console.warn(`${LOG_PREF} ${file.name} : mission déjà publiée`);
            res.status(202).json({
                "missionNotPublished": {"isOK": false, "isBlocking": true, "label": "Cette mission n'a pas encore été publiée"},
                "isMissionValid": false,
                "nbBlockingErr": 1,
            });
        
        } else {
            //Build Json object with all attributes from checkMission and grabMissionInfos
            const jsRetCheck = checkM.checkMission(pboFileName);
            //Mission is invalid
            if (!jsRetCheck.isMissionValid) {
                console.warn(`${LOG_PREF} Mission non conforme: ${file.name}`);
                res.status(202).json(jsRetCheck);
            } else {
                const jsRetGrab = grabM.grabMissionInfos(pboFileName);
                //Merge JSON results from check and grab to feed addMission with every needed information for database saving
                const jsResult = Object.assign({}, jsRetCheck, jsRetGrab);
                res.status(200).json(jsResult);
            }
        }
        
    });

    //Fired when connection is aborted by client
    form.on("aborted", () => {
        console.error(`${LOG_PREF} Request aborted`);
        res.status(400).json("Request aborted by the client");
    });

    //Something went wrong (c'est parti en couille, faut le dire)
    form.on("error", (err) => {
        console.error(`${LOG_PREF} ${err}`);
        res.status(400).json({"Upload error":`${err}`});
    });
       
    form.on('end', function() {
        res.end();
    });

};