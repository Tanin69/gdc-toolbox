using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace ObjectsCommon.Missions.InnerAttributes
{
	public class MissionInformation<T>
	{
		[BsonElement("label")]
		[BsonRequired]
		[Required]
		public string Label { get; set; }

		[BsonElement("val")]
		[BsonRequired]
		[Required]
		public T Value { get; set; }
	}
}
