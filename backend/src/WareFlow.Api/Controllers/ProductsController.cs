using Microsoft.AspNetCore.Mvc;
using WareFlow.Api.Contracts.Products;
using WareFlow.Application.Products;

namespace WareFlow.Api.Controllers;

[ApiController]
[Route("api/products")]
public sealed class ProductsController(
    IProductService productService
) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(
        typeof(ProductResponse),
        StatusCodes.Status201Created
    )]
    public async Task<ActionResult<ProductResponse>> Create(
        CreateProductRequest request,
        CancellationToken cancellationToken)
    {
        var command = new CreateProductCommand(
            Sku: request.Sku,
            Name: request.Name,
            CategoryId: request.CategoryId,
            Unit: request.Unit,
            Description: request.Description,
            MinimumStock: request.MinimumStock
        );

        var product = await productService.CreateAsync(
            command,
            cancellationToken
        );

        return CreatedAtAction(
            nameof(GetById),
            new { id = product.Id },
            product
        );
    }

    [HttpGet]
    [ProducesResponseType(
        typeof(IReadOnlyList<ProductResponse>),
        StatusCodes.Status200OK
    )]
    public async Task<ActionResult<
        IReadOnlyList<ProductResponse>
    >> GetAll(CancellationToken cancellationToken)
    {
        var products =
            await productService.GetAllAsync(
                cancellationToken
            );

        return Ok(products);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(
        typeof(ProductResponse),
        StatusCodes.Status200OK
    )]
    [ProducesResponseType(
        StatusCodes.Status404NotFound
    )]
    public async Task<ActionResult<ProductResponse>> GetById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var product =
            await productService.GetByIdAsync(
                id,
                cancellationToken
            );

        if (product is null)
        {
            throw new ProductNotFoundException(id);
        }

        return Ok(product);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(
        typeof(ProductResponse),
        StatusCodes.Status200OK
    )]
    public async Task<ActionResult<ProductResponse>> Update(
        Guid id,
        UpdateProductRequest request,
        CancellationToken cancellationToken)
    {
        var command = new UpdateProductCommand(
            Id: id,
            Sku: request.Sku,
            Name: request.Name,
            CategoryId: request.CategoryId,
            Unit: request.Unit,
            Description: request.Description,
            MinimumStock: request.MinimumStock
        );

        var product = await productService.UpdateAsync(
            command,
            cancellationToken
        );

        return Ok(product);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(
        StatusCodes.Status204NoContent
    )]
    public async Task<IActionResult> Delete(
        Guid id,
        CancellationToken cancellationToken)
    {
        await productService.DeactivateAsync(
            id,
            cancellationToken
        );

        return NoContent();
    }
}