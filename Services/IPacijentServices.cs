using Ambulanta.Models;
using MongoDB.Bson;

namespace Ambulanta.Services
{
    public interface IPacijentService
    {
        List<Pacijent> Get();
        Pacijent Get(ObjectId id);
        Task<Pacijent> GetPacijentByEmailAsync(string email);
        Pacijent GetAndUpdate(ObjectId pacijentId,ObjectId pregledId);
        Pacijent Create(Pacijent pacijent);
        void Update(ObjectId id, Pacijent pacijent);
        void Remove(ObjectId id);
        bool RemoveAppointment(ObjectId pacijentId, ObjectId appointmentId);
        
        Task<bool> Register(RegistrationModel resource);
    }
}