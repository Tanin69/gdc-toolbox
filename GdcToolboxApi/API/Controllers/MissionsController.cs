﻿using Helpers;
using Manager;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ObjectsCommon.Missions;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Threading.Tasks;

namespace API.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class MissionsController : ControllerBase
	{

		/// <summary>
		/// Get all missions
		/// </summary>
		/// <returns></returns>
		[HttpGet]
		public ActionResult<List<MissionEntity>> GetAllMissions()
		{
			var business = new MissionBusiness();
			return Ok(business.GetAllMissions());
		}

		/// <summary>
		/// Find a specific mission by id
		/// </summary>
		/// <param name="idMission">Must be BsonType.ObjectId</param>
		/// <remarks>
		/// Sample request
		/// 
		///		GET api/Mission/634bf944e37946e35d02a83f
		/// 
		/// </remarks>
		/// <returns></returns>
		[HttpGet("{idMission}")]
		public ActionResult<MissionEntity> GetMissionById(string idMission)
		{
			return Ok(new MissionBusiness().GetMissionById(idMission));
		}

		/// <summary>
		/// Upload a new mission
		/// </summary>
		/// <param name="missionToCreate"></param>
		/// <returns>Newly created mission on success, error report otherwise</returns>
		[HttpPost]
		public ActionResult<MissionEntity> CreateMission([FromBody] MissionEntity missionToCreate)
		{
			return Ok(new MissionBusiness().CreateMission(missionToCreate));
		}

		/// <summary>
		/// Update a whole mission
		/// </summary>
		/// <param name="missionToUpdate"></param>
		/// <returns></returns>
		[HttpPut]
		public ActionResult<MissionEntity> UpdateMission([FromBody] MissionEntity missionToUpdate)
		{
			return Ok(new MissionBusiness().UpdateMission(missionToUpdate));
		}


		[HttpGet("copyTo/{name}")]
		public ActionResult CopyCollectionTo(string name)
		{
			//new MissionBusiness().CopyCollection(name);
			return Ok();
		}
	}
}
