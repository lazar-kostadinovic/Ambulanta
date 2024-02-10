using MongoDB.Driver;
using Ambulanta.Models;
using MongoDB.Bson;

namespace Ambulanta.Services
{
    public class AdminService : IAdminService
    {
        private readonly IMongoCollection<Admin> _admin;
        
        private readonly string _pepper;
        private readonly int _iteration;

        public AdminService(IAmbulantaDatabaseSettings settings, IMongoClient mongoClient, IConfiguration config)
        {
            var database = mongoClient.GetDatabase(settings.DatabaseName);
            _admin = database.GetCollection<Admin>(settings.AdminCollectionName);
            _pepper = config["PasswordHasher:Pepper"];
            _iteration = config.GetValue<int>("PasswordHasher:Iteration");
          
        }
        public Admin Get(ObjectId id)
        {
            return _admin.Find(admin => admin.Id == id).FirstOrDefault();
        }

        public async Task<Admin> GetAdminByEmailAsync(string email)
        {
            return await _admin.Find(admin => admin.Email == email).FirstOrDefaultAsync();
        }

        public void Remove(ObjectId id)
        {
            _admin.DeleteOne(admin => admin.Id == id);
        }

        public void Update(ObjectId id, Admin admin)
        {
            _admin.ReplaceOne(admin => admin.Id == id, admin);
        }
        public async Task<bool> Register(RegistrationModelAdmin resource)
        {
            var admin = new Admin
            {
                Ime = resource.Ime,
                Prezime = resource.Prezime,
                Adresa = resource.Adresa,
                BrojTelefona = resource.BrojTelefona,
                Role = UserRole.Admin,
                Email = resource.Email,
                PasswordSalt = PasswordHasher.GenerateSalt(),
            };
            admin.Password = PasswordHasher.ComputeHash(resource.Password, admin.PasswordSalt, _pepper, _iteration);
            _admin.InsertOne(admin);

            return true;
        }
    }
}