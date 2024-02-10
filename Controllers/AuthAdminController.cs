using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Ambulanta.Models;
using Ambulanta.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace Ambulanta.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class AuthAdminController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly IAdminService _admin;

        public AuthAdminController(IConfiguration config, IAdminService admin)
        {
            _config = config;
            _admin = admin;
        }

        [AllowAnonymous]
        [HttpPost]
        public async Task<IActionResult> Authenticate([FromBody] LoginModel login)
        {
            var admin = await _admin.GetAdminByEmailAsync(login.Email);

            var calculatedPassword = PasswordHasher.ComputeHash(login.Password, admin.PasswordSalt, _config["PasswordHasher:Pepper"], 3);
            if (admin == null || admin.Password != calculatedPassword)
            {
                return Unauthorized();
            }

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_config["Jwt:Key"]);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim(ClaimTypes.Email, admin.Email),
                    new Claim(ClaimTypes.Name, admin.Ime)
                }),
                Expires = DateTime.UtcNow.AddMinutes(15),
                Issuer = _config["Jwt:Issuer"],
                Audience = _config["Jwt:Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            return Ok(new { Token = tokenString });

        }
    }
}
