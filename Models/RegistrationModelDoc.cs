using System.ComponentModel.DataAnnotations;

namespace Ambulanta.Models
{

    public class RegistrationModelDoc
    {
        [Required]
        public string Ime { get; set; }
        [Required]
        public string Prezime { get; set; }
        [Required]
        public string Adresa { get; set; }
        [Required]
        public string BrojTelefona { get; set; }
        [Required]
        public Specijalizacija Specijalizacija { get; set; }
        [Required, EmailAddress]
        public string Email { get; set; }
        [Required]
        public string Password { get; set; }

    }
}
