using MongoDB.Bson.Serialization;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Serializers;
using System;
using System.Collections.Generic;
using System.Text;
using MongoDB.Bson.IO;
using System.Reflection.Metadata;
using System.Linq;
using System.Diagnostics;

namespace Helpers.Serializer
{
	/// <summary>
	/// Custom deserializer for MissionBriefing attribute
	/// </summary>
	public class MissionBriefingSerializer : SerializerBase<List<Tuple<string, string>>>
	{

		private static readonly IBsonSerializer<string[]> itemSerializer = BsonSerializer.LookupSerializer<string[]>();

		/// <summary>
		/// Deserialize MissionAttribute as a List of Dictionnary
		/// </summary>
		/// <remarks>
		/// Inspired by: https://csharp.hotexamples.com/examples/MongoDB.Bson.IO/BsonReader/ReadStartArray/php-bsonreader-readstartarray-method-examples.html
		/// Inspired by: https://groups.google.com/g/mongodb-csharp/c/nsLlhsSF2vc
		/// </remarks>
		/// <param name="context"></param>
		/// <param name="args"></param>
		/// <returns></returns>
		public override List<Tuple<string, string>> Deserialize(BsonDeserializationContext context, BsonDeserializationArgs args)
		{
			var reader = context.Reader;
			var result = new List<Tuple<string, string>>();

			reader.ReadStartArray();
			while (reader.State != BsonReaderState.EndOfArray)
			{
				var state = context.Reader.State;
				switch (state)
				{
					case BsonReaderState.Name:
						reader.SkipName();
						break;

					case BsonReaderState.Type:
						var type = reader.ReadBsonType();
						if (type == BsonType.Array)
						{
							string[] val = BsonSerializer.Deserialize<string[]>(reader);
							result.Add(new Tuple<string, string>(val[0], val[1]));
						}
						break;

					case BsonReaderState.Value:
						reader.SkipValue();
						break;
				}
			}
			reader.ReadEndArray();

			return result;
		}

		public override void Serialize(BsonSerializationContext context, BsonSerializationArgs args, List<Tuple<string, string>> value)
		{
			context.Writer.WriteStartArray();
			foreach (var val in value)
			{
				var array = new string[] { val.Item1, val.Item2 };
				itemSerializer.Serialize(context, array);
			}
			context.Writer.WriteEndArray();
		}
	}
}
