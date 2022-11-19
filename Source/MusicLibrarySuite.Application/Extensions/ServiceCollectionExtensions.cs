using System;
using System.Net.Http;

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Http;

namespace MusicLibrarySuite.Application.Extensions;

/// <summary>
/// Provides a set of extension methods for the <see cref="IServiceCollection" /> interface.
/// </summary>
public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Configures a binding between the <typeparamref name="TClientService" /> type and a named <see cref="HttpClient" />.
    /// The client name will be set to the type name of <typeparamref name="TClientService" />.
    /// </summary>
    /// <typeparam name="TClientService">
    /// The service client type.
    /// The type specified will be registered in the service collection as a transient service.
    /// See <see cref="ITypedHttpClientFactory{TClientService}" /> for more details about authoring typed clients.</typeparam>
    /// <typeparam name="TClientImplementation">
    /// The implementation client type.
    /// The type specified will be instantiated by the <see cref="ITypedHttpClientFactory{TImplementation}" /> instance.
    /// </typeparam>
    /// <param name="services">The <see cref="IServiceCollection" /> collection to add services to.</param>
    /// <returns>The same service collection so that multiple calls can be chained.</returns>
    /// <exception cref="InvalidOperationException">Thrown if a service URL is not found in the configuration.</exception>
    public static IServiceCollection AddServiceClient<TClientService, TClientImplementation>(this IServiceCollection services)
        where TClientService : class
        where TClientImplementation : class, TClientService
    {
        var clientTypeName = typeof(TClientImplementation).Name;
        services.AddHttpClient<TClientService, TClientImplementation>((serviceProvider, httpClient) =>
        {
            IConfiguration configuration = serviceProvider.GetRequiredService<IConfiguration>();
            var serviceUrl = configuration.GetServiceUrl(clientTypeName[..clientTypeName.LastIndexOf("Client")]);

            if (string.IsNullOrEmpty(serviceUrl))
            {
                throw new InvalidOperationException($"Unable to find a service URL for the '{clientTypeName}' client.");
            }

            httpClient.BaseAddress = new Uri(serviceUrl.TrimEnd('/') + "/");
        });

        return services;
    }
}
