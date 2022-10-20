using Helpers;
using MongoDB.Bson;
using MongoDB.Driver;
using ObjectsCommon.Missions;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;

namespace DAL
{
	public class MissionsRepository: BaseRepository
	{
		private readonly string COLLECTION_NAME = ConfigurationHelper.GetSetting("COLLECTION_NAME");

		/// <summary>
		/// Get all missions
		/// </summary>
		/// <returns></returns>
		public List<MissionEntity> GetAllMissions()
		{
			var list = this.GetCollection<MissionEntity>(COLLECTION_NAME);
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
			var mission = this.GetCollection<MissionEntity>(COLLECTION_NAME)
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

			var collection = this.GetCollection<MissionEntity>(COLLECTION_NAME);
			collection.InsertOne(mission);

			var newMission = collection
				.Find(filter)
				.Sort(sort)
				.Limit(1)
				.Single();

			return newMission;
		}

		public MissionEntity UpdateMission(MissionEntity missionToUpdate)
		{
			var filter = Builders<MissionEntity>.Filter.Eq("_id", missionToUpdate.IdMission);
			var result = this.GetCollection<MissionEntity>(COLLECTION_NAME)
				.ReplaceOne(filter, missionToUpdate);
			return GetMissionById(result.UpsertedId.AsString);
		}

		[Obsolete("DO NOT USE !!!")]
		public void CopyCollection(string targetName)
		{
			var clock = new Stopwatch();

			clock.Start();
			Database.CreateCollection(targetName);
			var secondCollection = this.GetCollection<MissionEntity>(targetName);
			var missions = GetAllMissions();

			secondCollection.InsertMany(missions);
			clock.Stop();
			Debug.WriteLine($"Total time: {clock.Elapsed.ToString("c")}");
		}
	}
}
