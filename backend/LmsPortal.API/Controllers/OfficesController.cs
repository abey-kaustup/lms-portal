using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LmsPortal.API.Data;
using LmsPortal.Core.Entities;

namespace LmsPortal.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class OfficesController : ControllerBase
    {
        private readonly LmsDbContext _context;

        public OfficesController(LmsDbContext context)
        {
            _context = context;
        }

        public record UpsertOfficeDto(int? Id, string OfficeName, string City, string State, string? Country);

        [HttpGet]
        public async Task<IActionResult> GetOffices()
        {
            var offices = await _context.Offices
                .Where(o => !o.IsDeleted)
                .Select(o => new
                {
                    o.Id,
                    o.OfficeCode,
                    o.OfficeName,
                    o.City,
                    o.State,
                    o.Country,
                    o.IsActive,
                    o.CreatedAt,
                    EmployeeCount = _context.Employees.Count(e => e.OfficeId == o.Id && !e.IsDeleted)
                })
                .OrderBy(o => o.OfficeName)
                .ToListAsync();

            return Ok(new { success = true, data = offices });
        }

        [HttpPost]
        [Authorize(Policy = "RequireHRAdmin")]
        public async Task<IActionResult> UpsertOffice([FromBody] UpsertOfficeDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.OfficeName) || string.IsNullOrWhiteSpace(dto.City) || string.IsNullOrWhiteSpace(dto.State))
                return BadRequest(new { success = false, message = "Office Name, City, and State are required." });

            Office? office = null;
            if (dto.Id.HasValue)
                office = await _context.Offices.FirstOrDefaultAsync(o => o.Id == dto.Id.Value && !o.IsDeleted);

            if (office == null)
            {
                office = new Office
                {
                    OfficeCode = "TEMP",
                    OfficeName = dto.OfficeName.Trim(),
                    City = dto.City.Trim(),
                    State = dto.State.Trim(),
                    Country = dto.Country?.Trim() ?? "India"
                };
                _context.Offices.Add(office);
                await _context.SaveChangesAsync();

                // Auto-generate display code O0001
                office.OfficeCode = $"O{office.Id:D4}";
            }
            else
            {
                office.OfficeName = dto.OfficeName.Trim();
                office.City = dto.City.Trim();
                office.State = dto.State.Trim();
                if (!string.IsNullOrWhiteSpace(dto.Country)) office.Country = dto.Country.Trim();
                office.UpdatedAt = IstDateTime.Now;
            }

            await _context.SaveChangesAsync();
            return Ok(new { success = true, data = office, message = "Office saved successfully." });
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "RequireHRAdmin")]
        public async Task<IActionResult> DeleteOffice(int id)
        {
            var office = await _context.Offices.FirstOrDefaultAsync(o => o.Id == id && !o.IsDeleted);
            if (office == null)
                return NotFound(new { success = false, message = "Office not found." });

            office.IsDeleted = true;
            office.UpdatedAt = IstDateTime.Now;

            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Office deleted successfully." });
        }
    }
}
