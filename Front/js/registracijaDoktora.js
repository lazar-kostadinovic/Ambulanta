document.addEventListener("DOMContentLoaded", function () {
  const doctorSpecializationSelect = document.getElementById(
    "doctorSpecialization"
  );

  const specijalizacijaMap = {
    0: "Opšta Praksa",
    1: "Kardiolog",
    2: "Dermatolog",
    3: "Hirurg",
    4: "Ortoped",
    5: "Oftamolog",
    6: "Pedijatar",
  };

  for (const key in specijalizacijaMap) {
    if (specijalizacijaMap.hasOwnProperty(key)) {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = specijalizacijaMap[key];
      doctorSpecializationSelect.appendChild(option);
    }
  }

  const registerDoctorForm = document.getElementById("registerDoctorForm");

  registerDoctorForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const doctorName = document.getElementById("doctorName").value;
    const doctorLastName = document.getElementById("doctorLastName").value;
    const doctorAddress = document.getElementById("doctorAddress").value;
    const doctorPhoneNumber =
      document.getElementById("doctorPhoneNumber").value;
    const doctorEmail = document.getElementById("doctorEmail").value;
    const doctorSpecialization = parseInt(doctorSpecializationSelect.value, 10);
    const doctorPassword = document.getElementById("doctorPassword").value;
    const data = {
      ime: doctorName,
      prezime: doctorLastName,
      adresa: doctorAddress,
      brojTelefona: doctorPhoneNumber,
      specijalizacija: doctorSpecialization,
      email: doctorEmail,
      password: doctorPassword,
    };
    console.log(data);

    fetch("http://localhost:5154/Doktor/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          alert("Neuspešna registracija lekara. Pokušajte ponovo!");
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((result) => {
        alert("Uspešna registracija lekara!");
        console.log(result);
      })
      .catch((error) => {
        console.error("Error:", error);
        if (error.response && error.response.status === 400) {
          console.log("Validation errors:", error.response.data.errors);
        }
      });
    window.location.href = "../html/index.html";
  });
});
