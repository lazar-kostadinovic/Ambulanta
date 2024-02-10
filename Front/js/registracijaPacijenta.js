document.addEventListener("DOMContentLoaded", function () {
  const registerForm = document.getElementById("patientRegistrationForm");

  registerForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const address = document.getElementById("address").value;
    const phoneNumber = document.getElementById("phoneNumber").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const data = {
      ime: firstName,
      prezime: lastName,
      adresa: address,
      brojTelefona: phoneNumber,
      email: email,
      password: password,
    };

    fetch("http://localhost:5154/Pacijent/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          alert("Neuspešna registracija pacijenta. Pokušajte ponovo!");
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((result) => {
        alert("Uspešna registracija pacijenta!");
        console.log(result);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
    window.location.href = "../html/index.html";
  });
});
