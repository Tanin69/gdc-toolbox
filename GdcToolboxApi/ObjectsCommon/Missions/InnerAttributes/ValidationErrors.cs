using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Text;

namespace ObjectsCommon.Missions.InnerAttributes
{
	public class ValidationErrors
	{
		[BsonElement("label")]
		public string Label { get; set; }

		[BsonElement("isOK")]
		public bool IsOk { get; set; }

	}
}
