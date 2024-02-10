using Ambulanta.Models;
using MongoDB.Bson;

namespace Ambulanta.Services
{
    public interface IPregledService
    {
        List<Pregled> Get();
        Pregled Get(ObjectId id);
        Pregled Create(Pregled pregled);
        void Update(ObjectId id, Pregled pregled);
        void Remove(ObjectId id);
        List<Pregled> GetDoctorAppointmentsInDateRange(ObjectId idDoktora, DateTime startDate, DateTime endDate);
    }
}