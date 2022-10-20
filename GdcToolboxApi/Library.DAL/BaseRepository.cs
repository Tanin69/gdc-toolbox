using Helpers;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Reflection;
using System.Text;

namespace DAL
{
	public abstract class BaseRepository
	{
		private MongoClient Client;
		protected IMongoDatabase Database;

		public BaseRepository()
		{
			var connectionString = $"{ConfigurationHelper.GetConnectionString("GdcToolboxConnection")}?retryWrites=true&w=majority";
			Client = new MongoClient(connectionString);
			Database = Client.GetDatabase("gdc");
		}

		protected IMongoCollection<T> GetCollection<T>(string collectionName)
		{
			IMongoCollection<T> collection = Database.GetCollection<T>(collectionName);
			return collection;
		}
    }
}
