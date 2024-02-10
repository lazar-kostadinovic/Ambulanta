using System.Globalization;
using Ambulanta.Models;
using Ambulanta.Services;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;

namespace Ambulanta.Controllers;

[ApiController]
[Route("[controller]")]
public class PregledController:ControllerBase
{
    private readonly IPregledService pregledService;
    private readonly IDoktorService doktorService;
    private readonly IPacijentService pacijentService;


    public PregledController(IPregledService pregledService, IDoktorService doktorService, IPacijentService pacijentService)
    {
        this.pregledService = pregledService;
        this.doktorService = doktorService;
        this.pacijentService = pacijentService;
    }

    [HttpGet]
    public ActionResult<List<Pregled>> Get()
    {
        return pregledService.Get();
    }

    [HttpGet("{id}")]
    public ActionResult<Pregled> Get(ObjectId id)
    {
        var pregled = pregledService.Get(id);

        if (pregled == null)
        {
            return NotFound($"Pregled with Id = {id} not found");
        }

        return pregled;
    }

    [HttpGet("availableTimeSlots/{idDoktora}/{datum}")]
    public ActionResult<IEnumerable<string>> GetAvailableTimeSlots(ObjectId idDoktora, DateTime datum)
    {
        try
        {
            var doctor = doktorService.Get(idDoktora);

            if (doctor == null)
            {
                return NotFound($"Doctor with Id = {idDoktora} not found");
            }
            var allTimeSlots = new List<string> { "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00" };

            var existingAppointments = pregledService.GetDoctorAppointmentsInDateRange(idDoktora, datum, datum.AddDays(1));
            var availableTimeSlots = allTimeSlots.Except(existingAppointments.Select(appointment => appointment.Datum.ToString("HH:mm")));

            return Ok(availableTimeSlots);
        }
        catch (Exception ex)
        {
            return StatusCode(500, "Internal Server Error");
        }
    }


    [HttpPost]
    public ActionResult<Pregled> Post([FromBody] Pregled pregled)
    {
        pregledService.Create(pregled);

        return CreatedAtAction(nameof(Get), new { id = pregled.Id }, pregled);
    }
    [HttpPost("schedule/{idDoktora}/{idPacijenta}/{datum}/{opis}")]
    public IActionResult ScheduleAppointment(ObjectId idDoktora, ObjectId idPacijenta, DateTime datum, string opis)
    {        
        var pregled = new Pregled
        {
            IdDoktora = idDoktora,
            IdPacijenta = idPacijenta,
            Datum = datum,
            Opis = opis,
            Status = StatusPregleda.Upcoming
        };

        if (pregled == null)
        {
            return BadRequest("Invalid appointment data");
        }

     
        var doctor = doktorService.Get(pregled.IdDoktora);
        if (doctor == null)
        {
            return NotFound("Doctor not found");
        }

        var patient = pacijentService.Get(pregled.IdPacijenta);
        if (patient == null)
        {
            return NotFound("Patient not found");
        }

        if (IsAppointmentConflict(pregled))
        {
            return BadRequest("Appointment time conflict");
        }

        pregledService.Create(pregled);
        pacijentService.GetAndUpdate(pregled.IdPacijenta,pregled.Id);
        doktorService.GetAndUpdate(pregled.IdDoktora,pregled.Id);

        return CreatedAtAction(nameof(pregledService.Get), new { id = pregled.Id }, pregled);
    }

    [HttpPut("{id}/{datum}/{opis}")]
    public ActionResult Put(ObjectId id, DateTime datum, string opis)
    {
        var existingPregled = pregledService.Get(id);

        if (existingPregled == null)
        {
            return NotFound($"Pregled with Id = {id} not found");
        }

        var pregled = new Pregled
        {
            Id = existingPregled. Id,
            IdDoktora = existingPregled.IdDoktora,
            IdPacijenta = existingPregled.IdPacijenta,
            Datum = datum,
            Opis = opis,
            Status = existingPregled.Status
        };

        pregledService.Update(id, pregled);

        return NoContent();
    }

    [HttpDelete("{id}")]
    public ActionResult Delete(ObjectId id)
    {
        var pregled = pregledService.Get(id);

        if (pregled == null)
        {
            return NotFound($"Pregled with Id = {id} not found");
        }

        var patientId = pregled.IdPacijenta; 
        var doctorId = pregled.IdDoktora;  

        if (!pacijentService.RemoveAppointment(patientId, id))
        {
            return NotFound($"Patient with Id = {patientId} or appointment with Id = {id} not found");
        }

        if (!doktorService.RemoveAppointment(doctorId, id))
        {
            return NotFound($"Doctor with Id = {doctorId} or appointment with Id = {id} not found");
        }

        pregledService.Remove(id);


        return Ok($"Pregled with Id = {id} deleted");
    }

    private bool IsAppointmentConflict(Pregled pregled)
    {
        var doctor = doktorService.Get(pregled.IdDoktora);
        if (doctor.PredstojeciPregledi.Any(existingAppointmentId =>
            pregledService.Get(existingAppointmentId)?.Datum == pregled.Datum))
        {
            return true;
        }

        var patient = pacijentService.Get(pregled.IdPacijenta);
        if (patient.IstorijaPregleda.Any(existingAppointmentId =>
            pregledService.Get(existingAppointmentId)?.Datum == pregled.Datum))
        {
            return true;
        }

        return false;
    }
}