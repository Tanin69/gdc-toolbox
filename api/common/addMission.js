/**
 *
 * Adds a mission to database
 * Used by : missionAddController and ./private/bulkImport
 * @param {Object} - A JSON object with all collection properties
 * @returns {boolean|err} - true if success, err object in other case
 * @todo - labels should be initialized here and not in checkMission.js and grabMissionINfos.js 
 */

//App module imports
const Mission = require("../models/mission");

//DBG variable
const DBG_PREF = "DBG/addMission.js->";

exports.addMission = function (jsRes) {

    const receivedPboName = jsRes.missionPbo.val;
    console.info(`${DBG_PREF} ${receivedPboName} : début de l'ajout de la mission à la base de données`);

    //Checks if the mission already exists in DB. If true, delete it before adding data
    Mission.findOneAndDelete({"missionPbo.val": receivedPboName}, function(err, data){    
        if(err){
            console.error(`Error during findMission: ${err}`);
            return next(err);
        } else {
            console.info(`${DBG_PREF} ${receivedPboName} : l'enregistrement précédent de la mission a été supprimé de la base`);
        }
    });

    const mission = new Mission({
        fileIsPbo: {
            "isOK": jsRes.fileIsPbo.isOK,
            "label": jsRes.fileIsPbo.label,
        },
        filenameConvention: {
            "isOK": jsRes.filenameConvention.isOK,
            "label": jsRes.filenameConvention.label,
        },
        descriptionExtFound: {
            "isOK": jsRes.descriptionExtFound.isOK,
            "label": jsRes.descriptionExtFound.label,
        },
        missionSqmFound: {
            "isOK": jsRes.missionSqmFound.isOK,
            "label": jsRes.missionSqmFound.label,
        },
        briefingSqfFound: {
            "isOK": jsRes.briefingSqfFound.isOK,
            "label": jsRes.briefingSqfFound.label,
        },
        missionSqmNotBinarized: {
            "isOK": jsRes.missionSqmNotBinarized.isOK,
            "label": jsRes.missionSqmNotBinarized.label,
        },
        HCSlotFound: {
            "isOK": jsRes.HCSlotFound.isOK,
            "label": jsRes.HCSlotFound.label,
        },
        isMissionValid: jsRes.isMissionValid,
        isMissionArchived: false,
        nbBlockingErr: jsRes.nbBlockingErr,
        missionTitle: {
            "val": jsRes.missionTitle.val,
            "label": jsRes.missionTitle.label,
        },
        missionVersion: {
            "val": jsRes.missionVersion.val,
            "label": jsRes.missionVersion.label,
        },
        missionMap: {
            "val": jsRes.missionMap.val,
            "label": jsRes.missionMap.label,
        },
        gameType: {
            "val": jsRes.gameType.val,
            "label": jsRes.gameType.label,
        },
        author: {
            "val": jsRes.author.val,
            "label": jsRes.author.label,
        },
        minPlayers: {
            "val": jsRes.minPlayers.val,
            "label": jsRes.minPlayers.label,
        },
        maxPlayers: {
            "val": jsRes.maxPlayers.val,
            "label": jsRes.maxPlayers.label,
        },
        onLoadName: {
            "val": jsRes.onLoadName.val,
            "label": jsRes.onLoadName.label,
        },
        onLoadMission: {
            "val": jsRes.onLoadMission.val,
            "label": jsRes.onLoadMission.label,
        },
        overviewText: {
            "val": jsRes.overviewText.val,
            "label": jsRes.overviewText.label,
        },
        missionPbo: {
            "val": jsRes.missionPbo.val,
            "label": jsRes.missionPbo.label,
        },
        pboFileSize: {
            "val": jsRes.pboFileSize.val,
            "label": jsRes.pboFileSize.label,
        },
        pboFileDateM: {
            "val": jsRes.pboFileDateM.val,
            "label": jsRes.pboFileDateM.label,
        },
        owner: {
            "val": jsRes.owner.val,
            "label": jsRes.owner.label,
        },
        missionIsPlayable: {
            "val": jsRes.missionIsPlayable.val,
            "label": jsRes.missionIsPlayable.label,
        },
        missionBriefing: jsRes.missionBriefing,
        loadScreen: {
            "val": jsRes.loadScreen.val,
            "label": jsRes.loadScreen.label,
        },
        IFA3mod: {
            "val": jsRes.IFA3mod.val,
            "label": jsRes.IFA3mod.label,
        }
    });
    
    mission.save(function (err, mission) {
        if(err){
            console.error(`${DBG_PREF} ${receivedPboName} - Error during DB saving: ${err}`);
            return next(err);
        } else {
            console.info(`${DBG_PREF} ${receivedPboName} : la mission a été ajoutée à la base`);
            return true;
        }
    });
    
    /*
    .then(() => {
        console.log(`${DBG_PREF} ${receivedPboName} : la mission a été ajoutée à la base`);
        return true;
    })
    .catch(function(err){
        return err;
    });
    /*
    .then(() => res.status(201).json({mission}))
    .then(() => console.log(`${DBG_PREF} ${receivedPboName} : la mission a été ajoutée à la base`))
    .catch(error => res.status(400).json({ error }));
    */
};