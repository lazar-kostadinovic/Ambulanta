document.addEventListener("DOMContentLoaded", function () {
  const profileLink = document.getElementById("profileLink");
  const logoutLink = document.getElementById("logoutLink");
  const showUpdateFormBtn = document.getElementById("showUpdateFormBtn");
  const updateProfileForm = document.getElementById("updateProfileForm");
  const adminNameSpan = document.getElementById("adminName");
  const adminEmailSpan = document.getElementById("adminEmail");
  const adminAdressSpan = document.getElementById("adminAdress");
  const adminPhoneNumberSpan = document.getElementById("adminPhoneNumber");
  var token = localStorage.getItem("token");
  var userEmail = localStorage.getItem("email");

  const specijalizacijaMap = {
    0: "Opšta Praksa",
    1: "Kardiolog",
    2: "Dermatolog",
    3: "Hirurg",
    4: "Ortoped",
    5: "Oftamolog",
    6: "Pedijatar",
  };

  if (!token) {
    window.location.href = "../html/login.html";
  }

  fetch(`http://localhost:5154/Admin/GetAdminByEmail/${userEmail}`)
    .then((response) => {
      if (!response.ok) {
        alert("Greška prilikom prikaya Administratora.");
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      adminNameSpan.textContent = `${data.ime} ${data.prezime}`;
      adminEmailSpan.textContent = data.email;
      document.getElementById("newEmail").value = data.email;
      adminAdressSpan.textContent = data.adresa;
      document.getElementById("newAdresa").value = data.adresa;
      adminPhoneNumberSpan.textContent = data.brojTelefona;
      document.getElementById("newBrojTelefona").value = data.brojTelefona;
    })
    .catch((error) => {
      console.error("Fetch error:", error);
    });

  showUpdateFormBtn.addEventListener("click", function () {
    if(updateProfileForm.style.display == "block")
      updateProfileForm.style.display = "none";
    else
      updateProfileForm.style.display = "block";
    patientListContainer.innerHTML = "";
    doctorListContainer.innerHTML = "";
    appointmentsListContainer.innerHTML="";
  });

  updateProfileForm.addEventListener("submit", function (event) {
    event.preventDefault();
    

    const newAdresa = document.getElementById("newAdresa").value;
    const newBrojTelefona = document.getElementById("newBrojTelefona").value;
    const newEmail = document.getElementById("newEmail").value;

    fetch(
      `http://localhost:5154/Admin/${userEmail}/${newAdresa}/${newBrojTelefona}/${newEmail}`,
      {
        method: "PUT",
      }
    )
      .then((response) => {
        if (!response.ok) {
          alert(
            "Greška prilikom ažuriranja informacija o administratoru. Pokušajte ponovo!"
          );
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
      })
      .then((data) => {
        alert("Vaše informacije su uspešno ažurirane!");
        window.location.href = "../html/adminProfil.html";
      })
      .catch((error) => {
        console.error("Fetch error:", error);
      });
  });

  const viewPatientsBtn = document.getElementById("viewPatientsBtn");
  const viewDoctorsBtn = document.getElementById("viewDoctorsBtn");
  const viewAppointmentsBtn = document.getElementById("viewAppointmentsBtn");
  const registerDoctorBtn = document.getElementById("registerDoctorBtn");

  const patientListContainer = document.getElementById("patientListContainer");
  viewPatientsBtn.addEventListener("click", function () {
    fetch("http://localhost:5154/Pacijent")
      .then((response) => {
        if (!response.ok) {
          alert("Greška prilikom prikaza pacijenata.");
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((patients) => {
        displayPatientList(patients);
      })
      .catch((error) => {
        console.error("Fetch error:", error);
      });
  });

  function displayPatientList(patients) {
    patientListContainer.innerHTML = "";
    doctorListContainer.innerHTML = "";
    appointmentsListContainer.innerHTML="";

    if (patients.length === 0) {
      patientListContainer.innerHTML = "<p>Nema pacijenata.</p>";
      return;
    }

    const patientList = document.createElement("ul");
    patients.forEach((patient) => {
      const patientItem = document.createElement("li");
      patientItem.textContent = `${patient.ime} ${patient.prezime} - ${patient.email}`;
      patientList.appendChild(patientItem);
    });

    patientListContainer.appendChild(patientList);
  }

  const doctorListContainer = document.getElementById("doctorListContainer");
  viewDoctorsBtn.addEventListener("click", function () {
    fetch("http://localhost:5154/Doktor")
      .then((response) => {
        if (!response.ok) {
          alert("Greška prilikom prikaza lekara.");
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((doctors) => {
        displayDoctorList(doctors);
      })
      .catch((error) => {
        console.error("Fetch error:", error);
      });
  });

  function displayDoctorList(doctors) {
    patientListContainer.innerHTML = "";
    doctorListContainer.innerHTML = "";
    appointmentsListContainer.innerHTML="";

    if (doctors.length === 0) {
      doctorListContainer.innerHTML = "<p>Nema lekara.</p>";
      return;
    }

    const doctorList = document.createElement("ul");
    doctors.forEach((doctor) => {
      const doctorItem = document.createElement("li");
      const specijalizacijaString = specijalizacijaMap[doctor.specijalizacija];
      doctorItem.textContent = `${doctor.ime} ${doctor.prezime} - ${specijalizacijaString}`;

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Obriši";
      deleteButton.addEventListener("click", function () {
        deleteDoctor(doctor.id);
      });

      doctorItem.appendChild(deleteButton);
      doctorList.appendChild(doctorItem);
    });

    doctorListContainer.appendChild(doctorList);
  }

  function deleteDoctor(doctorId) {
    fetch(`http://localhost:5154/Doktor/${toId(doctorId)}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          alert("Greška prilikom brisanja doktora. Pokušajte ponovo!");
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
      })
      .then((data) => {
        alert("Profil uspešno obrisan!");
        viewDoctorsBtn.click();
      })
      .catch((error) => {
        console.error("Fetch error:", error);
      });
  }

  viewAppointmentsBtn.addEventListener("click", function () {
    fetch("http://localhost:5154/Pregled")
      .then((response) => {
        if (!response.ok) {
          alert("Greška prilikom prikaza pregleda.");
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((appointments) => {
        displayAppointmentsList(appointments);
      })
      .catch((error) => {
        console.error("Fetch error:", error);
      });
  });

  function displayAppointmentsList(appointments) {
    patientListContainer.innerHTML = "";
    doctorListContainer.innerHTML = "";
    const appointmentsListContainer = document.getElementById(
      "appointmentsListContainer"
    );
    appointmentsListContainer.innerHTML = "";

    if (appointments.length === 0) {
      appointmentsListContainer.innerHTML = "<p>Nema pregleda.</p>";
      return;
    }

    const appointmentsList = document.createElement("ul");
    appointments.forEach((appointment) => {
      Promise.all([
        fetchDoctorName(toId(appointment.idDoktora)),
        fetchPatientName(toId(appointment.idPacijenta)),
      ])
        .then(([doctorName, patientName]) => {
          const appointmentItem = document.createElement("li");
          appointmentItem.textContent = `Pacijent: ${patientName} / Doktor: ${doctorName} / Datum: ${convertDateFormat(
            appointment.datum
          )} Opis: ${appointment.opis}`;
          appointmentsList.appendChild(appointmentItem);
        })
        .catch((error) => {
          console.error("Error fetching doctor or patient name:", error);
        });
    });

    appointmentsListContainer.appendChild(appointmentsList);
  }
  function fetchDoctorName(doctorId) {
    return fetch(`http://localhost:5154/Doktor/${doctorId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((doctor) => {
        return `${doctor.ime} ${doctor.prezime}`;
      })
      .catch((error) => {
        console.error("Fetch doctor name error:", error);
      });
  }

  function fetchPatientName(patientId) {
    return fetch(`http://localhost:5154/Pacijent/${patientId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((patient) => {
        return `${patient.ime} ${patient.prezime}`;
      })
      .catch((error) => {
        console.error("Fetch patient name error:", error);
      });
  }

  registerDoctorBtn.addEventListener("click", function () {
    window.location.href = "../html/registracijaDoktora.html";
  });

  profileLink.addEventListener("click", function () {
    window.location.href = "../html/adminProfil.html";
  });

  logoutLink.addEventListener("click", function () {
    localStorage.removeItem("userRole");
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    window.location.href = "../html/index.html";
  });

  function toId(id) {
    const objectIdString =
      id.timestamp.toString(16).padStart(8, "0") +
      id.machine.toString(16).padStart(6, "0") +
      ((id.pid >>> 0) & 0xffff).toString(16).padStart(4, "0") +
      id.increment.toString(16).padStart(6, "0");
    return objectIdString;
  }
  function convertDateFormat(dateTimeString) {
    const inputDateFormat = new Date(dateTimeString);

    const options = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: false,
      timeZone: "UTC",
    };

    const formattedDate = inputDateFormat.toLocaleString("en-US", options);
    const [datePart, timePart] = formattedDate.split(", ");
    const [month, day, year] = datePart.split("/");
    return `${day}/${month}/${year}, ${timePart}`;
  }


});
