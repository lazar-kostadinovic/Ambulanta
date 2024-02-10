using Ambulanta.Models;
using MongoDB.Bson;

namespace Ambulanta.Services
{
    public interface IAdminService
    {
        Admin Get(ObjectId id);
        Task<Admin> GetAdminByEmailAsync(string email);
        void Update(ObjectId id, Admin admin);
        void Remove(ObjectId id);
        Task<bool> Register(RegistrationModelAdmin resource);
    }
}