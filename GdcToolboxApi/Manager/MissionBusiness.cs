using DAL;
using ObjectsCommon.Missions;
using System;
using System.Collections.Generic;

namespace Manager
{
	public class MissionBusiness
	{
		private MissionsRepository Repository { get { return new MissionsRepository(); } }

		/// <summary>
		/// Retrieve specific mission by id
		/// </summary>
		/// <param name="idMission"></param>
		/// <returns></returns>
		public MissionEntity GetMissionById(string idMission)
		{
			return Repository.GetMissionById(idMission);
		}

		/// <summary>
		/// Return all missions from database
		/// </summary>
		/// <returns></returns>
		public List<MissionEntity> GetAllMissions()
		{
			var missions = Repository.GetAllMissions();
			return missions;
		}

		public MissionEntity CreateMission(MissionEntity mission)
		{
			return Repository.CreateMission(mission);
		}

		public MissionEntity UpdateMission(MissionEntity missionToUpdate)
		{
			missionToUpdate.PboFileDateM.Value = DateTime.Now;
			return Repository.UpdateMission(missionToUpdate);
		}

		[Obsolete("DO NOT USE !!!")]
		public void CopyCollection(string name)
		{
			Repository.CopyCollection(name);
		}
	}
}
