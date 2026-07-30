using Microsoft.AspNetCore.Mvc;
using WareFlow.Api.Contracts.Categories;
using WareFlow.Application.Categories;

namespace WareFlow.Api.Controllers;

[ApiController]
[Route("api/categories")]
public sealed class CategoriesController(
    ICategoryService categoryService
) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(
        typeof(CategoryResponse),
        StatusCodes.Status201Created
    )]
    [ProducesResponseType(
        StatusCodes.Status400BadRequest
    )]
    [ProducesResponseType(
        StatusCodes.Status409Conflict
    )]
    public async Task<ActionResult<CategoryResponse>> Create(
        CreateCategoryRequest request,
        CancellationToken cancellationToken)
    {
        var command = new CreateCategoryCommand(
            Name: request.Name,
            Description: request.Description
        );

        var category = await categoryService.CreateAsync(
            command,
            cancellationToken
        );

        return CreatedAtAction(
            nameof(GetById),
            new { id = category.Id },
            category
        );
    }

    [HttpGet]
    [ProducesResponseType(
        typeof(IReadOnlyList<CategoryResponse>),
        StatusCodes.Status200OK
    )]
    public async Task<ActionResult<
        IReadOnlyList<CategoryResponse>
    >> GetAll(CancellationToken cancellationToken)
    {
        var categories =
            await categoryService.GetAllAsync(
                cancellationToken
            );

        return Ok(categories);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(
        typeof(CategoryResponse),
        StatusCodes.Status200OK
    )]
    [ProducesResponseType(
        StatusCodes.Status404NotFound
    )]
    public async Task<ActionResult<CategoryResponse>> GetById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var category =
            await categoryService.GetByIdAsync(
                id,
                cancellationToken
            );

        if (category is null)
        {
            throw new CategoryNotFoundException(id);
        }

        return Ok(category);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(
        typeof(CategoryResponse),
        StatusCodes.Status200OK
    )]
    [ProducesResponseType(
        StatusCodes.Status400BadRequest
    )]
    [ProducesResponseType(
        StatusCodes.Status404NotFound
    )]
    [ProducesResponseType(
        StatusCodes.Status409Conflict
    )]
    public async Task<ActionResult<CategoryResponse>> Update(
        Guid id,
        UpdateCategoryRequest request,
        CancellationToken cancellationToken)
    {
        var command = new UpdateCategoryCommand(
            Id: id,
            Name: request.Name,
            Description: request.Description
        );

        var category = await categoryService.UpdateAsync(
            command,
            cancellationToken
        );

        return Ok(category);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(
        StatusCodes.Status204NoContent
    )]
    [ProducesResponseType(
        StatusCodes.Status404NotFound
    )]
    public async Task<IActionResult> Delete(
        Guid id,
        CancellationToken cancellationToken)
    {
        await categoryService.DeactivateAsync(
            id,
            cancellationToken
        );

        return NoContent();
    }
}