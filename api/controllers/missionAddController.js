/**
 * Publishes a mission. Do a check before publishing the mission.
 * 
 * @name /api/mission/add
 * 
 * @example <caption>Typical POST request to publish a mission</caption>
 * 
 * //header\\
 * POST /api/mission/add HTTP/1.1
 * Accept: application/json
 * Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryWmunjnPoLceaU7KM
 * 
 * //body\\
 * ------WebKitFormBoundaryWmunjnPoLceaU7KM
 * Content-Disposition: form-data; name="file"; filename="CPC-CO[25]-WelcomeToTheJungle-V2.pja305.pbo"
 * Content-Type: application/octet-stream
 * //here is the file content
 * ------WebKitFormBoundaryWmunjnPoLceaU7KM--
 * 
 * @path {POST} /api/mission/add
 * @header {String} Accept application/json
 * @header {String} Content-Type multipart/form-data
 * @body {formData} form - an html form containing the mission pbo file to be uploaded
 * @response {JSON} Success full mission json 
 * @response {JSON} Failed check result
 * @response {JSON} Error error message from server
 * @code {201} Success: the mission is published
 * @code {202} Failed: the check reported an error
 * @code {400} Error: bad request (file size exceeded, incomplete form, etc.)
 */

//External module imports
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const { IncomingForm } = require('formidable');

//App module imports
const checkM = require("../common/checkMission");
const grabM = require("../common/grabMissionInfos");
const addM = require("../common/addMission");

//LOG prefix
const moduleName = path.basename(__filename);
const LOG_PREF = `${moduleName}->`;

//Reads environment variables
dotenv.config();

exports.addMission = function (req, res) {

    const form = new IncomingForm({ maxFileSize: 10 * 1024 * 1024 });

    form.parse(req);

    form.on("fileBegin", (name, file) => {
        console.info(`${LOG_PREF} ${file.name} : début de réception du fichier`);
        file.path = process.env.UPLOAD_DIR + file.name;
    });

    form.on("file", (name, file) => {

        const pboFileName = process.env.UPLOAD_DIR + file.name;
        console.info(`${LOG_PREF} ${file.name} : taille du fichier reçu: ${file.size}`);

        //Checks if the mission pbo was previously published. If yes, we launch a 202 http code and return a well formed JSON.
        if (fs.existsSync(process.env.MISSIONS_DIR + file.name)) {
            console.warn(`${LOG_PREF} ${file.name} - Warn: mission déjà publiée`);
            res.status(202).json({
                "missionNotPublished": { "isOK": false, "isBlocking": true, "label": "Cette mission n'a pas encore été publiée" },
                "isMissionValid": false,
                "nbBlockingErr": 1,
            });

        } else {
            //Build Json object with all attributes from checkMission and grabMissionInfos
            const jsRetCheck = checkM.checkMission(pboFileName);
            //Mission is invalid
            if (!jsRetCheck.isMissionValid) {
                res.status(202).json(jsRetCheck);
                console.warn(`${LOG_PREF} ${file.name} - Warn: mission non conforme`);
                console.log(jsRetCheck);
                return;
            } else {
                const jsRetGrab = grabM.grabMissionInfos(pboFileName);
                //Merge JSON results from check and grab to feed addMission with every needed information for database saving
                const jsResult = Object.assign({}, jsRetCheck, jsRetGrab);
                addM.addMission(jsResult);
                res.status(201).json(jsResult);

                //In case the script has been called by addMission.js from the client, we move the uploaded pbo it to the missions directory
                //fs.renameSync(process.env.UPLOAD_DIR + req.body.missionPbo, process.env.MISSIONS_DIR + req.body.missionPbo);
                fs.rename(pboFileName, process.env.MISSIONS_DIR + file.name, function (err) {
                    if (err) {
                        console.error(`${LOG_PREF} ${file.name} - Error: aucun pbo à déplacer !`);
                        return err;
                    } else {
                        console.info(`${LOG_PREF} ${file.name} déplacé dans ${process.env.MISSIONS_DIR}`);
                        return true;
                    }
                });
            }
        }

    });

    //Fired when connection is aborted by client
    form.on("aborted", () => {
        console.error(`${LOG_PREF} - Error: request aborted`);
        res.status(400).json("Request aborted by the client");
    });

    //Something went wrong (c'est parti en couille, faut le dire)
    form.on("error", (err) => {
        console.error(`${LOG_PREF}: ${err}`);
        res.status(400).json({ "Upload error": `${err}` });
    });

    form.on('end', function () {
        res.end();
    });

};