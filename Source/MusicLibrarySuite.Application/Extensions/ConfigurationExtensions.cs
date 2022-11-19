using Microsoft.Extensions.Configuration;

namespace MusicLibrarySuite.Application.Extensions;

/// <summary>
/// Provides a set of extension methods for the <see cref="IConfiguration" /> interface.
/// </summary>
public static class ConfigurationExtensions
{
    /// <summary>
    /// Represents a shorthand method for the GetSection("ServiceUrls")[serviceName] expression.
    /// </summary>
    /// <param name="configuration">The application configuration.</param>
    /// <param name="serviceName">The service name.</param>
    /// <returns>The service URL string or <see langword="null" />.</returns>
    public static string? GetServiceUrl(this IConfiguration configuration, string serviceName)
    {
        return configuration?.GetSection("ServiceUrls")?[serviceName];
    }
}
