using Ambulanta.Models;
using Ambulanta.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;

namespace Ambulanta.Controllers;

[ApiController]
[Route("[controller]")]
public class PacijentController:ControllerBase
{
    private readonly IPacijentService pacijentService;
    private readonly string _pepper;
    private readonly int _iteration;

    public PacijentController(IPacijentService pacijentService, IConfiguration config)
    {
        this.pacijentService = pacijentService;
        _pepper = config["PasswordHasher:Pepper"];
        _iteration = config.GetValue<int>("PasswordHasher:Iteration");
    }

    [HttpGet]
    public ActionResult<List<Pacijent>> Get()
    {
        return pacijentService.Get();
    }

    [HttpGet("{id}")]
    public ActionResult<Pacijent> Get(ObjectId id)
    {
        var pacijent = pacijentService.Get(id);

        if (pacijent == null)
        {
            return NotFound($"Pacijent with Id = {id} not found");
        }

        return pacijent;
    }

    [HttpGet("GetPacijentByEmail/{email}")]
    public async Task<IActionResult> GetPacijentByEmail(string email)
    {
        var pacijent = await pacijentService.GetPacijentByEmailAsync(email);

        if (pacijent == null)
        {
            return NotFound($"Pacijent with email = {email} not found");
        }

        return Ok(pacijent);
    }

    [HttpPost("{ime}/{prezime}/{adresa}/{brojTelefona}/{email}")]
    public ActionResult<Pacijent> Post(string ime, string prezime, string adresa, string brojTelefona, string email)
    {
        var pacijent = new Pacijent
        {
            Ime = ime,
            Prezime = prezime,
            Adresa = adresa,
            BrojTelefona = brojTelefona,
            Email = email
        };
        pacijentService.Create(pacijent);

        return CreatedAtAction(nameof(Get), new { id = pacijent.Id }, pacijent);
    }

    [HttpPut("{email}/{adresa}/{brojTelefona}/{newEmail}")]
    public async Task<ActionResult> Put(string email, string adresa, string brojTelefona, string newEmail)
    {
        var existingPacijent = await pacijentService.GetPacijentByEmailAsync(email);
        var id = existingPacijent.Id;
        if (existingPacijent == null)
        {
            return NotFound($"Pacijent with Email = {email} not found");
        }

        var pacijent = new Pacijent
        {
            Id = existingPacijent.Id,
            Ime = existingPacijent.Ime,
            Prezime = existingPacijent.Prezime,
            Adresa = adresa,
            BrojTelefona = brojTelefona,
            Email = newEmail,
            Password = existingPacijent.Password,
            PasswordSalt = existingPacijent.PasswordSalt,
            Role = existingPacijent.Role,
            IstorijaPregleda = existingPacijent.IstorijaPregleda
        };

        pacijentService.Update(id, pacijent);

        return NoContent();
    }

    [HttpDelete("{id}")]
    public ActionResult Delete(ObjectId id)
    {
        var pacijent = pacijentService.Get(id);

        if (pacijent == null)
        {
            return NotFound($"Pacijent with Id = {id} not found");
        }

        pacijentService.Remove(pacijent.Id);

        return Ok($"Pacijent with Id = {id} deleted");
    }

[HttpPost("register")]
[AllowAnonymous]
public async Task<IActionResult> Register([FromBody] RegistrationModel resource)
{
    try
    {
        var response = await pacijentService.Register(resource);
        return Ok(response);
    }
    catch (Exception e)
    {
        return BadRequest(new { ErrorMessage = e.Message });
    }
}

}