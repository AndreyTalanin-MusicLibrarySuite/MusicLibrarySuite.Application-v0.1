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
/// Represents a Web API controller for the <see cref="Work" /> entity.
/// </summary>
[ApiController]
[Route("api/[controller]/[action]")]
public class WorkController : ControllerBase
{
    private readonly ICatalogServiceClient m_catalogServiceClient;

    /// <summary>
    /// Initializes a new instance of the <see cref="WorkController" /> type using the specified services.
    /// </summary>
    /// <param name="catalogServiceClient">The catalog service client.</param>
    public WorkController(ICatalogServiceClient catalogServiceClient)
    {
        m_catalogServiceClient = catalogServiceClient;
    }

    /// <summary>
    /// Asynchronously gets a work by its unique identifier.
    /// </summary>
    /// <param name="workId">The work's unique identifier.</param>
    /// <returns>
    /// The task object representing the asynchronous operation.
    /// The task's result will be the work found or <see langword="null" />.
    /// </returns>
    [HttpGet]
    [Produces("application/json")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Work>> GetWorkAsync([Required][FromQuery] Guid workId)
    {
        try
        {
            Work work = await m_catalogServiceClient.GetWorkAsync(workId);
            return Ok(work);
        }
        catch (ApiException apiException) when (apiException.StatusCode == StatusCodes.Status404NotFound)
        {
            return NotFound();
        }
    }

    /// <summary>
    /// Asynchronously gets works by an array of unique identifiers.
    /// </summary>
    /// <param name="workIds">The array of unique identifiers to search for.</param>
    /// <returns>
    /// The task object representing the asynchronous operation.
    /// The task's result will be an array containing all found works.
    /// </returns>
    [HttpGet]
    [Produces("application/json")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<Work[]>> GetWorksAsync([Required][FromQuery] Guid[] workIds)
    {
        Work[] workArray = (await m_catalogServiceClient.GetWorksAsync(workIds)).ToArray();
        return Ok(workArray);
    }

    /// <summary>
    /// Asynchronously gets all works.
    /// </summary>
    /// <returns>
    /// The task object representing the asynchronous operation.
    /// The task's result will be an array containing all works.
    /// </returns>
    [HttpGet]
    [Produces("application/json")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<Work[]>> GetAllWorksAsync()
    {
        Work[] workArray = (await m_catalogServiceClient.GetAllWorksAsync()).ToArray();
        return Ok(workArray);
    }

    /// <summary>
    /// Asynchronously gets works by a work page request.
    /// </summary>
    /// <param name="pageSize">The page size.</param>
    /// <param name="pageIndex">The page index.</param>
    /// <param name="title">The filter value for the <see cref="Work.Title" /> property.</param>
    /// <param name="enabled">The filter value for the <see cref="Work.Enabled" /> property.</param>
    /// <returns>
    /// The task object representing the asynchronous operation.
    /// The task's result will be an array containing all works corresponding to the request configuration.
    /// </returns>
    [HttpGet]
    [Produces("application/json")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<WorkPageResponse>> GetPagedWorksAsync([Required][FromQuery] int pageSize, [Required][FromQuery] int pageIndex, [FromQuery] string? title, [FromQuery] bool? enabled)
    {
        WorkPageResponse pageResponse = await m_catalogServiceClient.GetPagedWorksAsync(pageSize, pageIndex, title, enabled);
        return Ok(pageResponse);
    }

    /// <summary>
    /// Asynchronously gets all work relationships by a work's unique identifier.
    /// </summary>
    /// <param name="workId">The work's unique identifier.</param>
    /// <param name="includeReverseRelationships">A boolean value specifying whether reverse relationships should be included.</param>
    /// <returns>
    /// The task object representing the asynchronous operation.
    /// The task's result will be an array containing all work relationships.
    /// </returns>
    [HttpGet]
    [Produces("application/json")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<WorkRelationship[]>> GetWorkRelationshipsAsync([Required][FromQuery] Guid workId, [FromQuery] bool includeReverseRelationships)
    {
        WorkRelationship[] workRelationshipArray = (await m_catalogServiceClient.GetWorkRelationshipsAsync(workId, includeReverseRelationships)).ToArray();
        return Ok(workRelationshipArray);
    }

    /// <summary>
    /// Asynchronously creates a new work.
    /// </summary>
    /// <param name="work">The work to create.</param>
    /// <returns>
    /// The task object representing the asynchronous operation.
    /// The task's result will be the created work with properties like <see cref="Work.Id" /> set.
    /// </returns>
    [HttpPost]
    [Produces("application/json")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<Work>> CreateWorkAsync([Required][FromBody] Work work)
    {
        Work createdWork = await m_catalogServiceClient.CreateWorkAsync(work);
        return Ok(createdWork);
    }

    /// <summary>
    /// Asynchronously updates an existing work.
    /// </summary>
    /// <param name="work">The work to update.</param>
    /// <returns>The task object representing the asynchronous operation.</returns>
    [HttpPut]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> UpdateWorkAsync([Required][FromBody] Work work)
    {
        try
        {
            await m_catalogServiceClient.UpdateWorkAsync(work);
            return Ok();
        }
        catch (ApiException apiException) when (apiException.StatusCode == StatusCodes.Status404NotFound)
        {
            return NotFound();
        }
    }

    /// <summary>
    /// Asynchronously deletes an existing work.
    /// </summary>
    /// <param name="workId">The unique identifier of the work to delete.</param>
    /// <returns>The task object representing the asynchronous operation.</returns>
    [HttpDelete]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> DeleteWorkAsync([Required][FromQuery] Guid workId)
    {
        try
        {
            await m_catalogServiceClient.DeleteWorkAsync(workId);
            return Ok();
        }
        catch (ApiException apiException) when (apiException.StatusCode == StatusCodes.Status404NotFound)
        {
            return NotFound();
        }
    }
}
