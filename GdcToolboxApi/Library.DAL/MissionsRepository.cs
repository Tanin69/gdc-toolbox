using MongoDB.Bson;
using MongoDB.Driver;
using ObjectsCommon.Missions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace DAL
{
	public class MissionsRepository: BaseRepository
	{
		/// <summary>
		/// Get all missions
		/// </summary>
		/// <returns></returns>
		public List<MissionEntity> GetAllMissions()
		{
			var list = this.GetCollection<MissionEntity>("missions");
			return list
				.AsQueryable()
				.ToList();
		}

		/// <summary>
		/// Retrieve a mission by its id
		/// </summary>
		/// <param name="idMission"></param>
		/// <returns></returns>
		public MissionEntity GetMissionById(string idMission)
		{
			var filter = Builders<MissionEntity>.Filter.Eq("_id", idMission);
			var mission = this.GetCollection<MissionEntity>("missions")
				.Find(filter)
				.Single();

			return mission;
		}

		/// <summary>
		/// Create a new mission and return it
		/// </summary>
		/// <param name="mission"></param>
		/// <returns></returns>
		public MissionEntity CreateMission(MissionEntity mission)
		{
			var filter = Builders<MissionEntity>.Filter.Empty;
			var sort = Builders<MissionEntity>.Sort.Descending("_id");

			var collection = this.GetCollection<MissionEntity>("missions");
			collection.InsertOne(mission);

			var newMission = collection
				.Find(filter)
				.Sort(sort)
				.Limit(1)
				.Single();

			return newMission;
		}
	}
}
