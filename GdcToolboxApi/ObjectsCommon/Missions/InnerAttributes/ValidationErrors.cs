using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace ObjectsCommon.Missions.InnerAttributes
{
	public class ValidationErrors
	{
		[BsonElement("label")]
		[BsonRequired]
		[Required]
		public string Label { get; set; }

		[BsonElement("isOK")]
		[BsonRequired]
		[Required]
		public bool IsOk { get; set; }

	}
}
