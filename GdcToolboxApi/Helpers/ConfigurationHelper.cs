using System;
using System.Configuration;

namespace Helpers
{
    public static class ConfigurationHelper
    {
        /// <summary>
        /// Récupère la valeur d'une variable d'environnement si elle existe. Sinon, elle renvoie la valeur spécifiée dans l'app.config / Web.config
        /// </summary>
        /// <param name="key"></param>
        /// <returns></returns>
        public static string GetSetting(string key)
        {
            var value = Environment.GetEnvironmentVariable(key);

            if (string.IsNullOrEmpty(value))
            {
                value = ConfigurationManager.AppSettings[key];
            }
            return value;
        }

        public static string GetConnectionString(string key)
        {
            var value = Environment.GetEnvironmentVariable(key);

            if (string.IsNullOrEmpty(value))
            {
                var connexionStringItem = ConfigurationManager.ConnectionStrings[key];
                value = connexionStringItem != null ? ConfigurationManager.ConnectionStrings[key].ConnectionString : null;
            }
            return value;
        }
    }

}
