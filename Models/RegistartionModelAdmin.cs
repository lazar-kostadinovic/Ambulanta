using System.ComponentModel.DataAnnotations;

namespace Ambulanta.Models
{

    public class RegistrationModelAdmin
    {
        [Required]
        public string Ime { get; set; }
        [Required]
        public string Prezime { get; set; }
        [Required]
        public string Adresa { get; set; }
        [Required]
        public string BrojTelefona { get; set; }
        [Required, EmailAddress]
        public string Email { get; set; }
        [Required]
        public string Password { get; set; }

    }
}
