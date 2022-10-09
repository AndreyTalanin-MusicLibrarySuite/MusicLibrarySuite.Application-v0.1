using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace MusicLibrarySuite.Application;

/// <summary>
/// Contains methods like <see cref="ConfigureServices(IServiceCollection)" /> or <see cref="Configure(IApplicationBuilder, IWebHostEnvironment)" />
/// that are called by the runtime to configure the generic host builder and the application's HTTP request pipeline.
/// </summary>
public class Startup
{
    private const string c_clientApplicationPath = "ClientApplication";

    /// <summary>
    /// Adds services to the container.
    /// </summary>
    /// <param name="services">The <see cref="IServiceCollection" /> collection for adding service descriptors.</param>
    /// <remarks>This method gets called by the runtime. Use this method to add services to the container.</remarks>
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddControllers();

        services.AddEndpointsApiExplorer();

        services.AddSwaggerGen();

        services.AddSpaStaticFiles(staticFilesOptions =>
        {
            staticFilesOptions.RootPath = $"{c_clientApplicationPath}/build";
        });
    }

    /// <summary>
    /// Configures the application's HTTP request pipeline.
    /// </summary>
    /// <param name="applicationBuilder">The request pipeline builder.</param>
    /// <param name="webHostEnvironment">The hosting environment information provider.</param>
    /// <remarks>This method gets called by the runtime. Use this method to configure the application's HTTP request pipeline.</remarks>
    public void Configure(IApplicationBuilder applicationBuilder, IWebHostEnvironment webHostEnvironment)
    {
        if (webHostEnvironment.IsDevelopment())
        {
            applicationBuilder.UseSwagger();
            applicationBuilder.UseSwaggerUI();

            applicationBuilder.UseDeveloperExceptionPage();
        }
        else
        {
            applicationBuilder.UseHsts();
        }

        applicationBuilder.UseHttpsRedirection();

        applicationBuilder.UseStaticFiles();
        applicationBuilder.UseSpaStaticFiles();

        applicationBuilder.UseRouting();

        applicationBuilder.UseAuthorization();

        applicationBuilder.UseEndpoints(endpointRouteBuilder =>
        {
            endpointRouteBuilder.MapControllers();
        });

        applicationBuilder.UseSpa(spaBuilder =>
        {
            spaBuilder.Options.SourcePath = c_clientApplicationPath;

            if (webHostEnvironment.IsDevelopment())
            {
                spaBuilder.UseReactDevelopmentServer(npmScript: "start");
            }
        });
    }
}
