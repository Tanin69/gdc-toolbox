using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Text;

namespace ObjectsCommon.Missions.InnerAttributes
{
	public class MissionInformation<T>
	{
		[BsonElement("label")]
		public string Label { get; set; }

		[BsonElement("val")]
		public T Value { get; set; }
	}
}
