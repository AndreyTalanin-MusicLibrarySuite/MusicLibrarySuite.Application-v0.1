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
/// Represents a Web API controller for the <see cref="Genre" /> entity.
/// </summary>
[ApiController]
[Route("api/[controller]/[action]")]
public class GenreController : ControllerBase
{
    private readonly ICatalogServiceClient m_catalogServiceClient;

    /// <summary>
    /// Initializes a new instance of the <see cref="GenreController" /> type using the specified services.
    /// </summary>
    /// <param name="catalogServiceClient">The catalog service client.</param>
    public GenreController(ICatalogServiceClient catalogServiceClient)
    {
        m_catalogServiceClient = catalogServiceClient;
    }

    /// <summary>
    /// Asynchronously gets a genre by its unique identifier.
    /// </summary>
    /// <param name="genreId">The genre's unique identifier.</param>
    /// <returns>
    /// The task object representing the asynchronous operation.
    /// The task's result will be the genre found or <see langword="null" />.
    /// </returns>
    [HttpGet]
    [Produces("application/json")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Genre>> GetGenreAsync([Required][FromQuery] Guid genreId)
    {
        try
        {
            Genre genre = await m_catalogServiceClient.GetGenreAsync(genreId);
            return Ok(genre);
        }
        catch (ApiException apiException) when (apiException.StatusCode == StatusCodes.Status404NotFound)
        {
            return NotFound();
        }
    }

    /// <summary>
    /// Asynchronously gets genres by an array of unique identifiers.
    /// </summary>
    /// <param name="genreIds">The array of unique identifiers to search for.</param>
    /// <returns>
    /// The task object representing the asynchronous operation.
    /// The task's result will be an array containing all found genres.
    /// </returns>
    [HttpGet]
    [Produces("application/json")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<Genre[]>> GetGenresAsync([Required][FromQuery] Guid[] genreIds)
    {
        Genre[] genreArray = (await m_catalogServiceClient.GetGenresAsync(genreIds)).ToArray();
        return Ok(genreArray);
    }

    /// <summary>
    /// Asynchronously gets all genres.
    /// </summary>
    /// <returns>
    /// The task object representing the asynchronous operation.
    /// The task's result will be an array containing all genres.
    /// </returns>
    [HttpGet]
    [Produces("application/json")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<Genre[]>> GetAllGenresAsync()
    {
        Genre[] genreArray = (await m_catalogServiceClient.GetAllGenresAsync()).ToArray();
        return Ok(genreArray);
    }

    /// <summary>
    /// Asynchronously gets genres by a genre page request.
    /// </summary>
    /// <param name="pageSize">The page size.</param>
    /// <param name="pageIndex">The page index.</param>
    /// <param name="name">The filter value for the <see cref="Genre.Name" /> property.</param>
    /// <param name="enabled">The filter value for the <see cref="Genre.Enabled" /> property.</param>
    /// <returns>
    /// The task object representing the asynchronous operation.
    /// The task's result will be an array containing all genres corresponding to the request configuration.
    /// </returns>
    [HttpGet]
    [Produces("application/json")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<GenrePageResponse>> GetPagedGenresAsync([Required][FromQuery] int pageSize, [Required][FromQuery] int pageIndex, [FromQuery] string? name, [FromQuery] bool? enabled)
    {
        GenrePageResponse pageResponse = await m_catalogServiceClient.GetPagedGenresAsync(pageSize, pageIndex, name, enabled);
        return Ok(pageResponse);
    }

    /// <summary>
    /// Asynchronously creates a new genre.
    /// </summary>
    /// <param name="genre">The genre to create.</param>
    /// <returns>
    /// The task object representing the asynchronous operation.
    /// The task's result will be the created genre with properties like <see cref="Genre.Id" /> set.
    /// </returns>
    [HttpPost]
    [Produces("application/json")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<Genre>> CreateGenreAsync([Required][FromBody] Genre genre)
    {
        Genre createdGenre = await m_catalogServiceClient.CreateGenreAsync(genre);
        return Ok(createdGenre);
    }

    /// <summary>
    /// Asynchronously updates an existing genre.
    /// </summary>
    /// <param name="genre">The genre to update.</param>
    /// <returns>The task object representing the asynchronous operation.</returns>
    [HttpPut]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> UpdateGenreAsync([Required][FromBody] Genre genre)
    {
        try
        {
            await m_catalogServiceClient.UpdateGenreAsync(genre);
            return Ok();
        }
        catch (ApiException apiException) when (apiException.StatusCode == StatusCodes.Status404NotFound)
        {
            return NotFound();
        }
    }

    /// <summary>
    /// Asynchronously deletes an existing genre.
    /// </summary>
    /// <param name="genreId">The unique identifier of the genre to delete.</param>
    /// <returns>The task object representing the asynchronous operation.</returns>
    [HttpDelete]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> DeleteGenreAsync([Required][FromQuery] Guid genreId)
    {
        try
        {
            await m_catalogServiceClient.DeleteGenreAsync(genreId);
            return Ok();
        }
        catch (ApiException apiException) when (apiException.StatusCode == StatusCodes.Status404NotFound)
        {
            return NotFound();
        }
    }
}
