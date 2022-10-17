using Helpers.Serializer;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson.Serialization.Options;
using ObjectsCommon.Missions.InnerAttributes;
using System;
using System.Collections.Generic;
using System.Text;

namespace ObjectsCommon.Missions
{
	public class MissionEntity
	{
		[BsonId]
		[BsonRepresentation(BsonType.ObjectId)]
		public string IdMission { get; set; }

		[BsonElement("__v")]
		private int Version;

		[BsonElement("missionBriefing")]
		[BsonSerializer(typeof(MissionBriefingSerializer))]
		public List<Dictionary<string, string>> MissionBriefing { get; set; }
		
		#region Validation PBO

		[BsonElement("fileIsPbo")]
		public ValidationErrors FileIsPbo { get; set; }

		[BsonElement("filenameConvention")]
		public ValidationErrors FilenameConvention { get; set; }

		[BsonElement("descriptionExtFound")]
		public ValidationErrors DescriptionExtFound { get; set; }

		[BsonElement("missionSqmFound")]
		public ValidationErrors MissionSqmFound { get; set; }

		[BsonElement("briefingSqfFound")]
		public ValidationErrors BriefingSqfFound { get; set; }

		[BsonElement("missionSqmNotBinarized")]
		public ValidationErrors MissionSqmNotBinarized { get; set; }

		[BsonElement("HCSlotFound")]
		public ValidationErrors HCSlotFound { get; set; }

		[BsonElement("isMissionValid")]
		public bool IsMissionValid { get; set; }

		[BsonElement("isMissionArchived")]
		public bool IsMissionArchived { get; set; }
		
		[BsonElement("nbBlockingErr")]
		public int TotalErrorCount { get; set; }
		#endregion

		#region Infos mission
		[BsonElement("missionTitle")]
		public MissionInformation<string> MissionTitle { get; set; }

		[BsonElement("missionVersion")]
		public MissionInformation<int> MissionVersion { get; set; }

		[BsonElement("missionMap")]
		public MissionInformation<string> MissionMap { get; set; }

		[BsonElement("gameType")]
		public MissionInformation<string> GameType { get; set; }

		[BsonElement("author")]
		public MissionInformation<string> Author { get; set; }

		[BsonElement("minPlayers")]
		public MissionInformation<int> MinPlayers { get; set; }

		[BsonElement("maxPlayers")]
		public MissionInformation<int> MaxPlayers { get; set; }

		[BsonElement("onLoadName")]
		public MissionInformation<string> OnLoadName { get; set; }

		[BsonElement("onLoadMission")]
		public MissionInformation<string> OnLoadMission { get; set; }

		[BsonElement("overviewText")]
		public MissionInformation<string> OverviewText { get; set; }

		[BsonElement("missionPbo")]
		public MissionInformation<string> MissionPbo { get; set; }

		[BsonElement("pboFileSize")]
		public MissionInformation<string> PboFileSize { get; set; }

		[BsonElement("pboFileDateM")]
		public MissionInformation<DateTime> PboFileDateM { get; set; }

		[BsonElement("owner")]
		public MissionInformation<string> Owner { get; set; }

		[BsonElement("missionIsPlayable")]
		public MissionInformation<bool> MissionIsPlayable { get; set; }

		[BsonElement("loadScreen")]
		public MissionInformation<string> LoadScreen { get; set; }

		[BsonElement("IFA3mod")]
		public MissionInformation<bool> IFA3mod { get; set; }
		#endregion

	}
}
