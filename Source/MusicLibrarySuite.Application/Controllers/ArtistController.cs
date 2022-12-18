using System;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using MusicLibrarySuite.CatalogService.Client;
using MusicLibrarySuite.CatalogService.Interfaces.Entities;

namespace MusicLibrarySuite.Application.Controllers;

/// <summary>
/// Represents a Web API controller for the <see cref="Artist" /> entity.
/// </summary>
[ApiController]
[Route("api/[controller]/[action]")]
public class ArtistController : ControllerBase
{
    private readonly ICatalogServiceClient m_catalogServiceClient;

    /// <summary>
    /// Initializes a new instance of the <see cref="ArtistController" /> type using the specified services.
    /// </summary>
    /// <param name="catalogServiceClient">The catalog service client.</param>
    public ArtistController(ICatalogServiceClient catalogServiceClient)
    {
        m_catalogServiceClient = catalogServiceClient;
    }

    /// <summary>
    /// Asynchronously gets an artist by its unique identifier.
    /// </summary>
    /// <param name="artistId">The artist's unique identifier.</param>
    /// <returns>
    /// The task object representing the asynchronous operation.
    /// The task's result will be the artist found or <see langword="null" />.
    /// </returns>
    [HttpGet]
    [Produces("application/json")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Artist>> GetArtistAsync([Required][FromQuery] Guid artistId)
    {
        try
        {
            Artist artist = await m_catalogServiceClient.GetArtistAsync(artistId);
            return Ok(artist);
        }
        catch (ApiException apiException) when (apiException.StatusCode == StatusCodes.Status404NotFound)
        {
            return NotFound();
        }
    }

    /// <summary>
    /// Asynchronously gets artists by an array of unique identifiers.
    /// </summary>
    /// <param name="artistIds">The array of unique identifiers to search for.</param>
    /// <returns>
    /// The task object representing the asynchronous operation.
    /// The task's result will be an array containing all found artists.
    /// </returns>
    [HttpGet]
    [Produces("application/json")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<Artist[]>> GetArtistsAsync([Required][FromQuery] Guid[] artistIds)
    {
        Artist[] artistArray = (await m_catalogServiceClient.GetArtistsAsync(artistIds)).ToArray();
        return Ok(artistArray);
    }

    /// <summary>
    /// Asynchronously gets all artists.
    /// </summary>
    /// <returns>
    /// The task object representing the asynchronous operation.
    /// The task's result will be an array containing all artists.
    /// </returns>
    [HttpGet]
    [Produces("application/json")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<Artist[]>> GetAllArtistsAsync()
    {
        Artist[] artistArray = (await m_catalogServiceClient.GetAllArtistsAsync()).ToArray();
        return Ok(artistArray);
    }

    /// <summary>
    /// Asynchronously gets artists by an artist page request.
    /// </summary>
    /// <param name="pageSize">The page size.</param>
    /// <param name="pageIndex">The page index.</param>
    /// <param name="name">The filter value for the <see cref="Artist.Name" /> property.</param>
    /// <param name="enabled">The filter value for the <see cref="Artist.Enabled" /> property.</param>
    /// <returns>
    /// The task object representing the asynchronous operation.
    /// The task's result will be an array containing all artists corresponding to the request configuration.
    /// </returns>
    [HttpGet]
    [Produces("application/json")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<ArtistPageResponse>> GetPagedArtistsAsync([Required][FromQuery] int pageSize, [Required][FromQuery] int pageIndex, [FromQuery] string? name, [FromQuery] bool? enabled)
    {
        ArtistPageResponse pageResponse = await m_catalogServiceClient.GetPagedArtistsAsync(pageSize, pageIndex, name, enabled);
        return Ok(pageResponse);
    }

    /// <summary>
    /// Asynchronously creates a new artist.
    /// </summary>
    /// <param name="artist">The artist to create.</param>
    /// <returns>
    /// The task object representing the asynchronous operation.
    /// The task's result will be the created artist with properties like <see cref="Artist.Id" /> set.
    /// </returns>
    [HttpPost]
    [Produces("application/json")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<Artist>> CreateArtistAsync([Required][FromBody] Artist artist)
    {
        Artist createdArtist = await m_catalogServiceClient.CreateArtistAsync(artist);
        return Ok(createdArtist);
    }

    /// <summary>
    /// Asynchronously updates an existing artist.
    /// </summary>
    /// <param name="artist">The artist to update.</param>
    /// <returns>The task object representing the asynchronous operation.</returns>
    [HttpPut]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> UpdateArtistAsync([Required][FromBody] Artist artist)
    {
        try
        {
            await m_catalogServiceClient.UpdateArtistAsync(artist);
            return Ok();
        }
        catch (ApiException apiException) when (apiException.StatusCode == StatusCodes.Status404NotFound)
        {
            return NotFound();
        }
    }

    /// <summary>
    /// Asynchronously deletes an existing artist.
    /// </summary>
    /// <param name="artistId">The unique identifier of the artist to delete.</param>
    /// <returns>The task object representing the asynchronous operation.</returns>
    [HttpDelete]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> DeleteArtistAsync([Required][FromQuery] Guid artistId)
    {
        try
        {
            await m_catalogServiceClient.DeleteArtistAsync(artistId);
            return Ok();
        }
        catch (ApiException apiException) when (apiException.StatusCode == StatusCodes.Status404NotFound)
        {
            return NotFound();
        }
    }
}
