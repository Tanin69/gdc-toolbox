using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.OpenApi.Models;
using System;
using System.IO;
using System.Reflection;

namespace GdcToolboxApi
{
	public class Startup
	{
		private readonly IHostingEnvironment _env;
		public Startup(IConfiguration configuration, IHostingEnvironment env)
		{
			Configuration = configuration;
			_env = env;
		}

		public IConfiguration Configuration { get; }

		// This method gets called by the runtime. Use this method to add services to the container.
		public void ConfigureServices(IServiceCollection services)
		{
			services.AddControllers(option =>
			{
				option.Filters.Add(new ProducesAttribute("application/json"));
			});
			services.AddSwaggerGen(options =>
			{
				options.SwaggerDoc("v1", new OpenApiInfo
				{
					Version = "v1",
					Title = "Gdc Toolbox API",
					Description = "An ASP.NET Core Web API for GDC Toolbox",
					Contact = new OpenApiContact()
					{
						Name = "Discord GDC",
						Url = new Uri("https://discord.com/invite/0e8ZrNIUVAuEwoUe")
					}
				});

				// using System.Reflection;
				var xmlFilename = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
				options.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, xmlFilename));
			});
		}

		// This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
		public void Configure(IApplicationBuilder app, IHostingEnvironment env)
		{
			if (env.IsDevelopment())
			{
				app.UseDeveloperExceptionPage();
			}

			// Swagger
			app.UseSwagger();
			app.UseSwaggerUI(option =>
			{
				option.SwaggerEndpoint("/swagger/v1/swagger.json", "v1");
				option.RoutePrefix = string.Empty;
			});

			app.UseHttpsRedirection();
			app.UseRouting();
			app.UseAuthorization();
			app.UseEndpoints(endpoints =>
			{
				endpoints.MapControllers();
			});
		}
	}
}
