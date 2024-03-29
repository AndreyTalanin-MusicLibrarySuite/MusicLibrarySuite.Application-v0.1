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
/// Represents a Web API controller for the <see cref="Release" /> entity.
/// </summary>
[ApiController]
[Route("api/[controller]/[action]")]
public class ReleaseController : ControllerBase
{
    private readonly ICatalogServiceClient m_catalogServiceClient;

    /// <summary>
    /// Initializes a new instance of the <see cref="ReleaseController" /> type using the specified services.
    /// </summary>
    /// <param name="catalogServiceClient">The catalog service client.</param>
    public ReleaseController(ICatalogServiceClient catalogServiceClient)
    {
        m_catalogServiceClient = catalogServiceClient;
    }

    /// <summary>
    /// Asynchronously gets a release by its unique identifier.
    /// </summary>
    /// <param name="releaseId">The release's unique identifier.</param>
    /// <returns>
    /// The task object representing the asynchronous operation.
    /// The task's result will be the release found or <see langword="null" />.
    /// </returns>
    [HttpGet]
    [Produces("application/json")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Release>> GetReleaseAsync([Required][FromQuery] Guid releaseId)
    {
        try
        {
            Release release = await m_catalogServiceClient.GetReleaseAsync(releaseId);
            return Ok(release);
        }
        catch (ApiException apiException) when (apiException.StatusCode == StatusCodes.Status404NotFound)
        {
            return NotFound();
        }
    }

    /// <summary>
    /// Asynchronously gets releases by an array of unique identifiers.
    /// </summary>
    /// <param name="releaseIds">The array of unique identifiers to search for.</param>
    /// <returns>
    /// The task object representing the asynchronous operation.
    /// The task's result will be an array containing all found releases.
    /// </returns>
    [HttpGet]
    [Produces("application/json")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<Release[]>> GetReleasesAsync([Required][FromQuery] Guid[] releaseIds)
    {
        Release[] releaseArray = (await m_catalogServiceClient.GetReleasesAsync(releaseIds)).ToArray();
        return Ok(releaseArray);
    }

    /// <summary>
    /// Asynchronously gets all releases.
    /// </summary>
    /// <returns>
    /// The task object representing the asynchronous operation.
    /// The task's result will be an array containing all releases.
    /// </returns>
    [HttpGet]
    [Produces("application/json")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<Release[]>> GetAllReleasesAsync()
    {
        Release[] releaseArray = (await m_catalogServiceClient.GetAllReleasesAsync()).ToArray();
        return Ok(releaseArray);
    }

    /// <summary>
    /// Asynchronously gets releases by a release page request.
    /// </summary>
    /// <param name="pageSize">The page size.</param>
    /// <param name="pageIndex">The page index.</param>
    /// <param name="title">The filter value for the <see cref="Release.Title" /> property.</param>
    /// <param name="enabled">The filter value for the <see cref="Release.Enabled" /> property.</param>
    /// <returns>
    /// The task object representing the asynchronous operation.
    /// The task's result will be an array containing all releases corresponding to the request configuration.
    /// </returns>
    [HttpGet]
    [Produces("application/json")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<ReleasePageResponse>> GetPagedReleasesAsync([Required][FromQuery] int pageSize, [Required][FromQuery] int pageIndex, [FromQuery] string? title, [FromQuery] bool? enabled)
    {
        ReleasePageResponse pageResponse = await m_catalogServiceClient.GetPagedReleasesAsync(pageSize, pageIndex, title, enabled);
        return Ok(pageResponse);
    }

    /// <summary>
    /// Asynchronously gets all release relationships by a release's unique identifier.
    /// </summary>
    /// <param name="releaseId">The release's unique identifier.</param>
    /// <param name="includeReverseRelationships">A boolean value specifying whether reverse relationships should be included.</param>
    /// <returns>
    /// The task object representing the asynchronous operation.
    /// The task's result will be an array containing all release relationships.
    /// </returns>
    [HttpGet]
    [Produces("application/json")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<ReleaseRelationship[]>> GetReleaseRelationshipsAsync([Required][FromQuery] Guid releaseId, [FromQuery] bool includeReverseRelationships)
    {
        ReleaseRelationship[] releaseRelationshipArray = (await m_catalogServiceClient.GetReleaseRelationshipsAsync(releaseId, includeReverseRelationships)).ToArray();
        return Ok(releaseRelationshipArray);
    }

    /// <summary>
    /// Asynchronously gets all release-to-product relationships by a release's unique identifier.
    /// </summary>
    /// <param name="releaseId">The release's unique identifier.</param>
    /// <returns>
    /// The task object representing the asynchronous operation.
    /// The task's result will be an array containing all release-to-product relationships.
    /// </returns>
    [HttpGet]
    [Produces("application/json")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<ReleaseToProductRelationship[]>> GetReleaseToProductRelationshipsAsync([Required][FromQuery] Guid releaseId)
    {
        ReleaseToProductRelationship[] releaseToProductRelationshipArray = (await m_catalogServiceClient.GetReleaseToProductRelationshipsAsync(releaseId)).ToArray();
        return Ok(releaseToProductRelationshipArray);
    }

    /// <summary>
    /// Asynchronously gets all release-to-product relationships by a product's unique identifier.
    /// </summary>
    /// <param name="productId">The product's unique identifier.</param>
    /// <returns>
    /// The task object representing the asynchronous operation.
    /// The task's result will be an array containing all release-to-product relationships.
    /// </returns>
    [HttpGet]
    [Produces("application/json")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<ReleaseToProductRelationship[]>> GetReleaseToProductRelationshipsByProductAsync([Required][FromQuery] Guid productId)
    {
        ReleaseToProductRelationship[] releaseToProductRelationshipArray = (await m_catalogServiceClient.GetReleaseToProductRelationshipsByProductAsync(productId)).ToArray();
        return Ok(releaseToProductRelationshipArray);
    }

    /// <summary>
    /// Asynchronously gets all release-to-release-group relationships by a release's unique identifier.
    /// </summary>
    /// <param name="releaseId">The release's unique identifier.</param>
    /// <returns>
    /// The task object representing the asynchronous operation.
    /// The task's result will be an array containing all release-to-release-group relationships.
    /// </returns>
    [HttpGet]
    [Produces("application/json")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<ReleaseToReleaseGroupRelationship[]>> GetReleaseToReleaseGroupRelationshipsAsync([Required][FromQuery] Guid releaseId)
    {
        ReleaseToReleaseGroupRelationship[] releaseToReleaseGroupRelationshipArray = (await m_catalogServiceClient.GetReleaseToReleaseGroupRelationshipsAsync(releaseId)).ToArray();
        return Ok(releaseToReleaseGroupRelationshipArray);
    }

    /// <summary>
    /// Asynchronously gets all release-to-release-group relationships by a release group's unique identifier.
    /// </summary>
    /// <param name="releaseGroupId">The release group's unique identifier.</param>
    /// <returns>
    /// The task object representing the asynchronous operation.
    /// The task's result will be an array containing all release-to-release-group relationships.
    /// </returns>
    [HttpGet]
    [Produces("application/json")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<ReleaseToReleaseGroupRelationship[]>> GetReleaseToReleaseGroupRelationshipsByReleaseGroupAsync([Required][FromQuery] Guid releaseGroupId)
    {
        ReleaseToReleaseGroupRelationship[] releaseToReleaseGroupRelationshipArray = (await m_catalogServiceClient.GetReleaseToReleaseGroupRelationshipsByReleaseGroupAsync(releaseGroupId)).ToArray();
        return Ok(releaseToReleaseGroupRelationshipArray);
    }

    /// <summary>
    /// Asynchronously gets all release-media-to-product relationships by a release's unique identifier.
    /// </summary>
    /// <param name="releaseId">The release's unique identifier.</param>
    /// <returns>
    /// The task object representing the asynchronous operation.
    /// The task's result will be an array containing all release-media-to-product relationships.
    /// </returns>
    [HttpGet]
    [Produces("application/json")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<ReleaseMediaToProductRelationship[]>> GetReleaseMediaToProductRelationshipsAsync([Required][FromQuery] Guid releaseId)
    {
        ReleaseMediaToProductRelationship[] releaseMediaToProductRelationshipArray = (await m_catalogServiceClient.GetReleaseMediaToProductRelationshipsAsync(releaseId)).ToArray();
        return Ok(releaseMediaToProductRelationshipArray);
    }

    /// <summary>
    /// Asynchronously gets all release-media-to-product relationships by a product's unique identifier.
    /// </summary>
    /// <param name="productId">The product's unique identifier.</param>
    /// <returns>
    /// The task object representing the asynchronous operation.
    /// The task's result will be an array containing all release-media-to-product relationships.
    /// </returns>
    [HttpGet]
    [Produces("application/json")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<ReleaseMediaToProductRelationship[]>> GetReleaseMediaToProductRelationshipsByProductAsync([Required][FromQuery] Guid productId)
    {
        ReleaseMediaToProductRelationship[] releaseMediaToProductRelationshipArray = (await m_catalogServiceClient.GetReleaseMediaToProductRelationshipsByProductAsync(productId)).ToArray();
        return Ok(releaseMediaToProductRelationshipArray);
    }

    /// <summary>
    /// Asynchronously gets all release-track-to-product relationships by a release's unique identifier.
    /// </summary>
    /// <param name="releaseId">The release's unique identifier.</param>
    /// <returns>
    /// The task object representing the asynchronous operation.
    /// The task's result will be an array containing all release-track-to-product relationships.
    /// </returns>
    [HttpGet]
    [Produces("application/json")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<ReleaseTrackToProductRelationship[]>> GetReleaseTrackToProductRelationshipsAsync([Required][FromQuery] Guid releaseId)
    {
        ReleaseTrackToProductRelationship[] releaseTrackToProductRelationshipArray = (await m_catalogServiceClient.GetReleaseTrackToProductRelationshipsAsync(releaseId)).ToArray();
        return Ok(releaseTrackToProductRelationshipArray);
    }

    /// <summary>
    /// Asynchronously gets all release-track-to-product relationships by a product's unique identifier.
    /// </summary>
    /// <param name="productId">The product's unique identifier.</param>
    /// <returns>
    /// The task object representing the asynchronous operation.
    /// The task's result will be an array containing all release-track-to-product relationships.
    /// </returns>
    [HttpGet]
    [Produces("application/json")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<ReleaseTrackToProductRelationship[]>> GetReleaseTrackToProductRelationshipsByProductAsync([Required][FromQuery] Guid productId)
    {
        ReleaseTrackToProductRelationship[] releaseTrackToProductRelationshipArray = (await m_catalogServiceClient.GetReleaseTrackToProductRelationshipsByProductAsync(productId)).ToArray();
        return Ok(releaseTrackToProductRelationshipArray);
    }

    /// <summary>
    /// Asynchronously gets all release-track-to-work relationships by a release's unique identifier.
    /// </summary>
    /// <param name="releaseId">The release's unique identifier.</param>
    /// <returns>
    /// The task object representing the asynchronous operation.
    /// The task's result will be an array containing all release-track-to-work relationships.
    /// </returns>
    [HttpGet]
    [Produces("application/json")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<ReleaseTrackToWorkRelationship[]>> GetReleaseTrackToWorkRelationshipsAsync([Required][FromQuery] Guid releaseId)
    {
        ReleaseTrackToWorkRelationship[] releaseTrackToWorkRelationshipArray = (await m_catalogServiceClient.GetReleaseTrackToWorkRelationshipsAsync(releaseId)).ToArray();
        return Ok(releaseTrackToWorkRelationshipArray);
    }

    /// <summary>
    /// Asynchronously gets all release-track-to-work relationships by a work's unique identifier.
    /// </summary>
    /// <param name="workId">The work's unique identifier.</param>
    /// <returns>
    /// The task object representing the asynchronous operation.
    /// The task's result will be an array containing all release-track-to-work relationships.
    /// </returns>
    [HttpGet]
    [Produces("application/json")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<ReleaseTrackToWorkRelationship[]>> GetReleaseTrackToWorkRelationshipsByWorkAsync([Required][FromQuery] Guid workId)
    {
        ReleaseTrackToWorkRelationship[] releaseTrackToWorkRelationshipArray = (await m_catalogServiceClient.GetReleaseTrackToWorkRelationshipsByWorkAsync(workId)).ToArray();
        return Ok(releaseTrackToWorkRelationshipArray);
    }

    /// <summary>
    /// Asynchronously creates a new release.
    /// </summary>
    /// <param name="release">The release to create.</param>
    /// <returns>
    /// The task object representing the asynchronous operation.
    /// The task's result will be the created release with properties like <see cref="Release.Id" /> set.
    /// </returns>
    [HttpPost]
    [Produces("application/json")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<Release>> CreateReleaseAsync([Required][FromBody] Release release)
    {
        Release createdRelease = await m_catalogServiceClient.CreateReleaseAsync(release);
        return Ok(createdRelease);
    }

    /// <summary>
    /// Asynchronously updates an existing release.
    /// </summary>
    /// <param name="release">The release to update.</param>
    /// <returns>The task object representing the asynchronous operation.</returns>
    [HttpPut]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> UpdateReleaseAsync([Required][FromBody] Release release)
    {
        try
        {
            await m_catalogServiceClient.UpdateReleaseAsync(release);
            return Ok();
        }
        catch (ApiException apiException) when (apiException.StatusCode == StatusCodes.Status404NotFound)
        {
            return NotFound();
        }
    }

    /// <summary>
    /// Asynchronously updates order of existing release-to-product relationships.
    /// </summary>
    /// <param name="releaseToProductRelationships">A collection of release-to-product relationships to reorder.</param>
    /// <param name="useReferenceOrder">A value indicating whether the reference order should be used.</param>
    /// <returns>The task object representing the asynchronous operation.</returns>
    [HttpPut]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> UpdateReleaseToProductRelationshipsOrderAsync([Required][FromBody] ReleaseToProductRelationship[] releaseToProductRelationships, [FromQuery] bool? useReferenceOrder)
    {
        try
        {
            await m_catalogServiceClient.UpdateReleaseToProductRelationshipsOrderAsync(useReferenceOrder, releaseToProductRelationships);
            return Ok();
        }
        catch (ApiException apiException) when (apiException.StatusCode == StatusCodes.Status404NotFound)
        {
            return NotFound();
        }
    }

    /// <summary>
    /// Asynchronously updates order of existing release-to-release-group relationships.
    /// </summary>
    /// <param name="releaseToReleaseGroupRelationships">A collection of release-to-release-group relationships to reorder.</param>
    /// <param name="useReferenceOrder">A value indicating whether the reference order should be used.</param>
    /// <returns>The task object representing the asynchronous operation.</returns>
    [HttpPut]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> UpdateReleaseToReleaseGroupRelationshipsOrderAsync([Required][FromBody] ReleaseToReleaseGroupRelationship[] releaseToReleaseGroupRelationships, [FromQuery] bool? useReferenceOrder)
    {
        try
        {
            await m_catalogServiceClient.UpdateReleaseToReleaseGroupRelationshipsOrderAsync(useReferenceOrder, releaseToReleaseGroupRelationships);
            return Ok();
        }
        catch (ApiException apiException) when (apiException.StatusCode == StatusCodes.Status404NotFound)
        {
            return NotFound();
        }
    }

    /// <summary>
    /// Asynchronously updates order of existing release-media-to-product relationships.
    /// </summary>
    /// <param name="releaseMediaToProductRelationships">A collection of release-media-to-product relationships to reorder.</param>
    /// <param name="useReferenceOrder">A value indicating whether the reference order should be used.</param>
    /// <returns>The task object representing the asynchronous operation.</returns>
    [HttpPut]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> UpdateReleaseMediaToProductRelationshipsOrderAsync([Required][FromBody] ReleaseMediaToProductRelationship[] releaseMediaToProductRelationships, [FromQuery] bool? useReferenceOrder)
    {
        try
        {
            await m_catalogServiceClient.UpdateReleaseMediaToProductRelationshipsOrderAsync(useReferenceOrder, releaseMediaToProductRelationships);
            return Ok();
        }
        catch (ApiException apiException) when (apiException.StatusCode == StatusCodes.Status404NotFound)
        {
            return NotFound();
        }
    }

    /// <summary>
    /// Asynchronously updates order of existing release-track-to-product relationships.
    /// </summary>
    /// <param name="releaseTrackToProductRelationships">A collection of release-track-to-product relationships to reorder.</param>
    /// <param name="useReferenceOrder">A value indicating whether the reference order should be used.</param>
    /// <returns>The task object representing the asynchronous operation.</returns>
    [HttpPut]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> UpdateReleaseTrackToProductRelationshipsOrderAsync([Required][FromBody] ReleaseTrackToProductRelationship[] releaseTrackToProductRelationships, [FromQuery] bool? useReferenceOrder)
    {
        try
        {
            await m_catalogServiceClient.UpdateReleaseTrackToProductRelationshipsOrderAsync(useReferenceOrder, releaseTrackToProductRelationships);
            return Ok();
        }
        catch (ApiException apiException) when (apiException.StatusCode == StatusCodes.Status404NotFound)
        {
            return NotFound();
        }
    }

    /// <summary>
    /// Asynchronously updates order of existing release-track-to-work relationships.
    /// </summary>
    /// <param name="releaseTrackToWorkRelationships">A collection of release-track-to-work relationships to reorder.</param>
    /// <param name="useReferenceOrder">A value indicating whether the reference order should be used.</param>
    /// <returns>The task object representing the asynchronous operation.</returns>
    [HttpPut]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> UpdateReleaseTrackToWorkRelationshipsOrderAsync([Required][FromBody] ReleaseTrackToWorkRelationship[] releaseTrackToWorkRelationships, [FromQuery] bool? useReferenceOrder)
    {
        try
        {
            await m_catalogServiceClient.UpdateReleaseTrackToWorkRelationshipsOrderAsync(useReferenceOrder, releaseTrackToWorkRelationships);
            return Ok();
        }
        catch (ApiException apiException) when (apiException.StatusCode == StatusCodes.Status404NotFound)
        {
            return NotFound();
        }
    }

    /// <summary>
    /// Asynchronously deletes an existing release.
    /// </summary>
    /// <param name="releaseId">The unique identifier of the release to delete.</param>
    /// <returns>The task object representing the asynchronous operation.</returns>
    [HttpDelete]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> DeleteReleaseAsync([Required][FromQuery] Guid releaseId)
    {
        try
        {
            await m_catalogServiceClient.DeleteReleaseAsync(releaseId);
            return Ok();
        }
        catch (ApiException apiException) when (apiException.StatusCode == StatusCodes.Status404NotFound)
        {
            return NotFound();
        }
    }
}
