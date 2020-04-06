//const searchSyncR = require ("./common/searchSynchRecursive");

//const readR            = require("klaw-sync");
//const readR = require("./common/searchSynchRecursive");

//const filter = return "briefing.sqf";

//ret = readR.searchR("briefing.sqf","D:/Dev/Projets/GdC-Missions/tmp/CPC-CO[25]-WelcomeToTheJungle-V2.pja305");

const klawSync = require("klaw-sync");
const path = require("path");
const dotenv           = require("dotenv");
//Read environment variables
dotenv.config();

const filterFn = item => path.basename(item.path) === "briefing.sqf";

res = klawSync("D:/Dev/Projets/GdC-Missions/tmp/CPC-CO[25]-WelcomeToTheJungle-V2.pja305", {traverseAll: true, filter: filterFn});
//res = findFile("briefing.sqf", "D:/Dev/Projets/GdC-Missions/tmp/CPC-CO[25]-WelcomeToTheJungle-V2.pja305");

console.log(res[0].stats);
