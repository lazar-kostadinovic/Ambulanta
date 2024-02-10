using Ambulanta.Models;
using Ambulanta.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;

namespace Ambulanta.Controllers;

[ApiController]
[Route("[controller]")]
public class AdminController:ControllerBase
{
    private readonly IAdminService adminService;

    public AdminController(IAdminService adminService, IConfiguration config)
    {
        this.adminService = adminService;
  
    }

    [HttpGet("{id}")]
    public ActionResult<Admin> Get(ObjectId id)
    {
        var admin = adminService.Get(id);

        if (admin == null)
        {
            return NotFound($"Admin with Id = {id} not found");
        }

        return admin;
    }

    [HttpGet("GetAdminByEmail/{email}")]
    public async Task<IActionResult> GetAdminByEmail(string email)
    {
        var admin = await adminService.GetAdminByEmailAsync(email);

        if (admin == null)
        {
            return NotFound($"Admin with email = {email} not found");
        }

        return Ok(admin);
    }

    [HttpPut("{email}/{adresa}/{brojTelefona}/{newEmail}")]
    public async Task<ActionResult> Put(string email, string adresa, string brojTelefona, string newEmail)
    {
        var existingAdmin = await adminService.GetAdminByEmailAsync(email);
        var id = existingAdmin.Id;

        if (existingAdmin == null)
        {
            return NotFound($"Admin with Email = {email} not found");
        }

        var admin = new Admin
        {
            Id = existingAdmin.Id,
            Ime = existingAdmin.Ime,
            Prezime = existingAdmin.Prezime,
            Adresa = adresa,
            Email = newEmail,
            Password = existingAdmin.Password,
            PasswordSalt = existingAdmin.PasswordSalt,
            BrojTelefona = brojTelefona,
            Role = existingAdmin.Role
        };

        adminService.Update(id, admin);

        return NoContent();
    }

    [HttpDelete("{id}")]
    public ActionResult Delete(ObjectId id)
    {
        var admin = adminService.Get(id);

        if (admin == null)
        {
            return NotFound($"Admin with Id = {id} not found");
        }

        adminService.Remove(admin.Id);

        return Ok($"Admin with Id = {id} deleted");
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register([FromBody] RegistrationModelAdmin resource)
    {
        try
        {
            var response = await adminService.Register(resource);
            return Ok(response);
        }
        catch (Exception e)
        {
            return BadRequest(new { ErrorMessage = e.Message });
        }
    }
}