/**
 * Returns all published missions as JSON object.
 *
 * @name /api/mission/list
 *
 * @example <caption>Typical GET request to obtain the list of published missions</caption>
 *
 * //header\\
 * GET /api/mission/list HTTP/1.1
 * content-type: text/html
 *
 * //body\\
 * //Nothing
 *
 * @path {GET} /api/mission/list
 * @header {String} Content-Type any value accepted in Content-type field (text/html for example)
 * @response {JSON} Success list of all published missions
 * @response {JSON} Error error message from server
 * @code {200} Success: list of missions successfully returned
 * @code {400} Error: bad request
 */

const Mission = require("../models/mission");

//Request the DB and return all missions in JSON format.
exports.listMissions = async function (req, res) {
	// TODO: Cache data. In prod we have to wait the server for 2 secs.
	//  Redis ? Maybe too complex to setup
	//  Files ? Can take a lot of disk space, and can be stressfull for HDD
	//  HTTP Cache ? Is it working with things like fetch ?
	// TODO: Maybe paginate data, can reduce rendering time on client side
	try {
		const missionsList = await Mission.find()
			.sort([["author", "ascending"]])
			.exec();
		// Successful, so render.
		res.status(200).json(missionsList);
	} catch (err) {
		return next(err);
	}
};
