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
	public class MissionBriefingSerializer : SerializerBase<
		List<Dictionary<string, string>>
	>
	{
		/// <summary>
		/// 
		/// </summary>
		/// <remarks>
		/// Inspired by: https://csharp.hotexamples.com/examples/MongoDB.Bson.IO/BsonReader/ReadStartArray/php-bsonreader-readstartarray-method-examples.html
		/// Inspired by: https://groups.google.com/g/mongodb-csharp/c/nsLlhsSF2vc
		/// </remarks>
		/// <param name="context"></param>
		/// <param name="args"></param>
		/// <returns></returns>
		public override List<Dictionary<string, string>> Deserialize(BsonDeserializationContext context, BsonDeserializationArgs args)
		{
			var reader = context.Reader;
			var result = new List<Dictionary<string, string>>();

			reader.ReadStartArray();
			while (reader.State != BsonReaderState.EndOfArray)
			{
				var state = context.Reader.State;

				Debug.WriteLine($"State: {state}");

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
							var dictionnary = new Dictionary<string, string>();
							dictionnary.Add(val[0], val[1]);
							result.Add(dictionnary);
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
	}
}
