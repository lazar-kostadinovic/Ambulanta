using Ambulanta.Models;
using Ambulanta.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;

namespace Ambulanta.Controllers;

[ApiController]
[Route("[controller]")]
public class DoktorController:ControllerBase
{
    private readonly IDoktorService doktorService;

    public DoktorController(IDoktorService doktorService, IConfiguration config)
    {
        this.doktorService = doktorService;
  
    }

    [HttpGet]
    public ActionResult<List<Doktor>> Get()
    {
        return doktorService.Get();
    }

    [HttpGet("{id}")]
    public ActionResult<Doktor> Get(ObjectId id)
    {
        var doktor = doktorService.Get(id);

        if (doktor == null)
        {
            return NotFound($"Doktor with Id = {id} not found");
        }

        return doktor;
    }

    [HttpGet("GetDocByEmail/{email}")]
    public async Task<IActionResult> GetDocByEmail(string email)
    {
        var doktor = await doktorService.GetDocByEmailAsync(email);

        if (doktor == null)
        {
            return NotFound($"Doktor with email = {email} not found");
        }

        return Ok(doktor);
    }

    [HttpGet("BySpecijalizacija/{specijalizacija}")]
    public ActionResult<List<Doktor>> GetBySpecijalizacija(Specijalizacija specijalizacija)
    {
        var doktoriBySpecijalizacija = doktorService.GetBySpecijalizacija(specijalizacija);

        if (doktoriBySpecijalizacija.Count == 0)
        {
            return NotFound($"No doctors with Specijalizacija = {specijalizacija} found");
        }

        return doktoriBySpecijalizacija;
    }


    [HttpPost("{ime}/{prezime}/{adresa}/{brojTelefona}/{email}/{specijalizacija}")]
    public ActionResult<Doktor> Post(string ime, string prezime, string adresa, string brojTelefona, string email, Specijalizacija specijalizacija)
    {
        var doktor = new Doktor
        {
            Ime = ime,
            Prezime = prezime,
            Adresa = adresa,
            BrojTelefona = brojTelefona,
            Email = email,
            Specijalizacija = specijalizacija
        };
        doktorService.Create(doktor);

        return CreatedAtAction(nameof(Get), new { id = doktor.Id }, doktor);
    }

    [HttpPut("{email}/{adresa}/{brojTelefona}/{newEmail}/{specijalizacija}")]
    public async Task<ActionResult> Put(string email, string adresa, string brojTelefona, string newEmail, Specijalizacija specijalizacija)
    {
        var existingDoctor = await doktorService.GetDocByEmailAsync(email);
        var id = existingDoctor.Id;

        if (existingDoctor == null)
        {
            return NotFound($"Doktor with Email = {email} not found");
        }

        var doktor = new Doktor
        {
            Id = existingDoctor.Id,
            Ime = existingDoctor.Ime,
            Prezime = existingDoctor.Prezime,
            Adresa = adresa,
            Email = newEmail,
            Password = existingDoctor.Password,
            PasswordSalt = existingDoctor.PasswordSalt,
            BrojTelefona = brojTelefona,
            Role = existingDoctor.Role,
            Specijalizacija = specijalizacija,
            PredstojeciPregledi = existingDoctor.PredstojeciPregledi
        };

        doktorService.Update(id, doktor);

        return NoContent();
    }

    [HttpDelete("{id}")]
    public ActionResult Delete(ObjectId id)
    {
        var doktor = doktorService.Get(id);

        if (doktor == null)
        {
            return NotFound($"Doktor with Id = {id} not found");
        }

        doktorService.Remove(doktor.Id);

        return Ok($"Doktor with Id = {id} deleted");
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register([FromBody] RegistrationModelDoc resource)
    {
        try
        {
            var response = await doktorService.Register(resource);
            return Ok(response);
        }
        catch (Exception e)
        {
            return BadRequest(new { ErrorMessage = e.Message });
        }
    }
}