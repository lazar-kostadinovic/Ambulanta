using Ambulanta.Models;
using MongoDB.Bson;

namespace Ambulanta.Services
{
    public interface IDoktorService
    {
        List<Doktor> Get();
        Doktor Get(ObjectId id);
        Task<Doktor> GetDocByEmailAsync(string email);
        List<Doktor> GetBySpecijalizacija(Specijalizacija specijalizacija);
        Doktor GetAndUpdate(ObjectId doktorId,ObjectId pregledId);
        Doktor Create(Doktor pacijent);
        void Update(ObjectId id, Doktor doktor);
        void Remove(ObjectId id);
        bool RemoveAppointment(ObjectId doktorId, ObjectId appointmentId);
        Task<bool> Register(RegistrationModelDoc resource);
    }
}