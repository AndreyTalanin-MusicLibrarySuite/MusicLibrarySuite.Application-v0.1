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
/// Represents a Web API controller for the <see cref="ReleaseGroup" /> entity.
/// </summary>
[ApiController]
[Route("api/[controller]/[action]")]
public class ReleaseGroupController : ControllerBase
{
    private readonly ICatalogServiceClient m_catalogServiceClient;

    /// <summary>
    /// Initializes a new instance of the <see cref="ReleaseGroupController" /> type using the specified services.
    /// </summary>
    /// <param name="catalogServiceClient">The catalog service client.</param>
    public ReleaseGroupController(ICatalogServiceClient catalogServiceClient)
    {
        m_catalogServiceClient = catalogServiceClient;
    }

    /// <summary>
    /// Asynchronously gets a release group by its unique identifier.
    /// </summary>
    /// <param name="releaseGroupId">The release group's unique identifier.</param>
    /// <returns>
    /// The task object representing the asynchronous operation.
    /// The task's result will be the release group found or <see langword="null" />.
    /// </returns>
    [HttpGet]
    [Produces("application/json")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ReleaseGroup>> GetReleaseGroupAsync([Required][FromQuery] Guid releaseGroupId)
    {
        try
        {
            ReleaseGroup releaseGroup = await m_catalogServiceClient.GetReleaseGroupAsync(releaseGroupId);
            return Ok(releaseGroup);
        }
        catch (ApiException apiException) when (apiException.StatusCode == StatusCodes.Status404NotFound)
        {
            return NotFound();
        }
    }

    /// <summary>
    /// Asynchronously gets release groups by an array of unique identifiers.
    /// </summary>
    /// <param name="releaseGroupIds">The array of unique identifiers to search for.</param>
    /// <returns>
    /// The task object representing the asynchronous operation.
    /// The task's result will be an array containing all found release groups.
    /// </returns>
    [HttpGet]
    [Produces("application/json")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<ReleaseGroup[]>> GetReleaseGroupsAsync([Required][FromQuery] Guid[] releaseGroupIds)
    {
        ReleaseGroup[] releaseGroupArray = (await m_catalogServiceClient.GetReleaseGroupsAsync(releaseGroupIds)).ToArray();
        return Ok(releaseGroupArray);
    }

    /// <summary>
    /// Asynchronously gets all release groups.
    /// </summary>
    /// <returns>
    /// The task object representing the asynchronous operation.
    /// The task's result will be an array containing all release groups.
    /// </returns>
    [HttpGet]
    [Produces("application/json")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<ReleaseGroup[]>> GetAllReleaseGroupsAsync()
    {
        ReleaseGroup[] releaseGroupArray = (await m_catalogServiceClient.GetAllReleaseGroupsAsync()).ToArray();
        return Ok(releaseGroupArray);
    }

    /// <summary>
    /// Asynchronously gets release groups by a release group page request.
    /// </summary>
    /// <param name="pageSize">The page size.</param>
    /// <param name="pageIndex">The page index.</param>
    /// <param name="title">The filter value for the <see cref="ReleaseGroup.Title" /> property.</param>
    /// <param name="enabled">The filter value for the <see cref="ReleaseGroup.Enabled" /> property.</param>
    /// <returns>
    /// The task object representing the asynchronous operation.
    /// The task's result will be an array containing all release groups corresponding to the request configuration.
    /// </returns>
    [HttpGet]
    [Produces("application/json")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<ReleaseGroupPageResponse>> GetPagedReleaseGroupsAsync([Required][FromQuery] int pageSize, [Required][FromQuery] int pageIndex, [FromQuery] string? title, [FromQuery] bool? enabled)
    {
        ReleaseGroupPageResponse pageResponse = await m_catalogServiceClient.GetPagedReleaseGroupsAsync(pageSize, pageIndex, title, enabled);
        return Ok(pageResponse);
    }

    /// <summary>
    /// Asynchronously gets all release group relationships by a release group's unique identifier.
    /// </summary>
    /// <param name="releaseGroupId">The release group's unique identifier.</param>
    /// <param name="includeReverseRelationships">A boolean value specifying whether reverse relationships should be included.</param>
    /// <returns>
    /// The task object representing the asynchronous operation.
    /// The task's result will be an array containing all release group relationships.
    /// </returns>
    [HttpGet]
    [Produces("application/json")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<ReleaseGroupRelationship[]>> GetReleaseGroupRelationshipsAsync([Required][FromQuery] Guid releaseGroupId, [FromQuery] bool includeReverseRelationships)
    {
        ReleaseGroupRelationship[] releaseGroupRelationshipArray = (await m_catalogServiceClient.GetReleaseGroupRelationshipsAsync(releaseGroupId, includeReverseRelationships)).ToArray();
        return Ok(releaseGroupRelationshipArray);
    }

    /// <summary>
    /// Asynchronously creates a new release group.
    /// </summary>
    /// <param name="releaseGroup">The release group to create.</param>
    /// <returns>
    /// The task object representing the asynchronous operation.
    /// The task's result will be the created release group with properties like <see cref="ReleaseGroup.Id" /> set.
    /// </returns>
    [HttpPost]
    [Produces("application/json")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<ReleaseGroup>> CreateReleaseGroupAsync([Required][FromBody] ReleaseGroup releaseGroup)
    {
        ReleaseGroup createdReleaseGroup = await m_catalogServiceClient.CreateReleaseGroupAsync(releaseGroup);
        return Ok(createdReleaseGroup);
    }

    /// <summary>
    /// Asynchronously updates an existing release group.
    /// </summary>
    /// <param name="releaseGroup">The release group to update.</param>
    /// <returns>The task object representing the asynchronous operation.</returns>
    [HttpPut]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> UpdateReleaseGroupAsync([Required][FromBody] ReleaseGroup releaseGroup)
    {
        try
        {
            await m_catalogServiceClient.UpdateReleaseGroupAsync(releaseGroup);
            return Ok();
        }
        catch (ApiException apiException) when (apiException.StatusCode == StatusCodes.Status404NotFound)
        {
            return NotFound();
        }
    }

    /// <summary>
    /// Asynchronously deletes an existing release group.
    /// </summary>
    /// <param name="releaseGroupId">The unique identifier of the release group to delete.</param>
    /// <returns>The task object representing the asynchronous operation.</returns>
    [HttpDelete]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> DeleteReleaseGroupAsync([Required][FromQuery] Guid releaseGroupId)
    {
        try
        {
            await m_catalogServiceClient.DeleteReleaseGroupAsync(releaseGroupId);
            return Ok();
        }
        catch (ApiException apiException) when (apiException.StatusCode == StatusCodes.Status404NotFound)
        {
            return NotFound();
        }
    }
}
