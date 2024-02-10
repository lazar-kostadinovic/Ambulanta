document.addEventListener("DOMContentLoaded", function () {
  const profileLink = document.getElementById("profileLink");
  const logoutLink = document.getElementById("logoutLink");
  const showUpdateFormBtn = document.getElementById("showUpdateFormBtn");
  const updateProfileForm = document.getElementById("updateProfileForm");
  const doctorNameSpan = document.getElementById("doctorName");
  const doctorEmailSpan = document.getElementById("doctorEmail");
  const doctorAdressSpan = document.getElementById("doctorAdress");
  const doctorPhoneNumberSpan = document.getElementById("doctorPhoneNumber");
  const doctorSpecijalizacijaSpan = document.getElementById(
    "doctorSpecijalizacija"
  );
  const newSpecijalizacijaSelect =
    document.getElementById("newSpecijalizacija");
  var token = localStorage.getItem("token");
  var userEmail = localStorage.getItem("email");
  var doctorId;

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

  fetch(`http://localhost:5154/Doktor/GetDocByEmail/${userEmail}`)
    .then((response) => {
      if (!response.ok) {
        alert("Failed to fetch doctor data.");
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      const id = data.id;
      doctorId = toId(id);
      doctorNameSpan.textContent = `${data.ime} ${data.prezime}`;
      doctorEmailSpan.textContent = data.email;
      document.getElementById("newEmail").value = data.email;
      doctorAdressSpan.textContent = data.adresa;
      document.getElementById("newAdresa").value = data.adresa;
      doctorPhoneNumberSpan.textContent = data.brojTelefona;
      document.getElementById("newBrojTelefona").value = data.brojTelefona;
      const specijalizacijaString = specijalizacijaMap[data.specijalizacija];
      doctorSpecijalizacijaSpan.textContent = specijalizacijaString;
      newSpecijalizacijaSelect.value = Object.keys(specijalizacijaMap)[0];
    })
    .catch((error) => {
      console.error("Fetch error:", error);
    });

  showUpdateFormBtn.addEventListener("click", function () {
    if (updateProfileForm.style.display == "none")
      updateProfileForm.style.display = "block";
    else updateProfileForm.style.display == "none";
  });

  Object.entries(specijalizacijaMap).forEach(([value, label]) => {
    const optionElement = document.createElement("option");
    optionElement.value = value;
    optionElement.textContent = label;
    newSpecijalizacijaSelect.appendChild(optionElement);
  });

  updateProfileForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const newAdresa = document.getElementById("newAdresa").value;
    const newBrojTelefona = document.getElementById("newBrojTelefona").value;
    const newEmail = document.getElementById("newEmail").value;
    const specijalizacijaValue =
      document.getElementById("newSpecijalizacija").value;

    fetch(
      `http://localhost:5154/Doktor/${userEmail}/${newAdresa}/${newBrojTelefona}/${newEmail}/${specijalizacijaValue}`,
      {
        method: "PUT",
      }
    )
      .then((response) => {
        if (!response.ok) {
          alert("Došlo je do greške pri ažuriranju. Pokušajte ponovo!");
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
      })
      .then((data) => {
        alert("Uspešno ste ažurirali informacije!");
        window.location.href = "../html/doktorProfil.html";
      })
      .catch((error) => {
        console.error("Fetch error:", error);
      });
  });

  previousAppointmentsListBtn.addEventListener("click", function () {
    if (previousAppointmentsListContainer.innerHTML != "") {
      previousAppointmentsListContainer.innerHTML = "";
    } else {
      fetch(`http://localhost:5154/Doktor/GetDocByEmail/${userEmail}`)
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          var appointments = data.predstojeciPregledi;
          console.log(appointments);
          showAppointments(appointments);
        })
        .catch((error) => {
          console.error("Fetch error:", error);
        });
    }
  });

  function showAppointments(appointments) {
    previousAppointmentsListContainer.innerHTML = "";
    if (appointments.length === 0) {
      previousAppointmentsListContainer.innerHTML = "<p>Nema pregleda.</p>";
      return;
    }

    const appointmentList = document.createElement("ul");

    Promise.all(appointments.map(appointment => {
      return fetch(`http://localhost:5154/Pregled/${toId(appointment)}`)
        .then(response => response.json());
    }))
    .then(appointmentsDetails => {
      return Promise.all(appointmentsDetails.map(appointment => {
        return fetch(`http://localhost:5154/Pacijent/${toId(appointment.idPacijenta)}`)
          .then(response => response.json());
      }))
      .then(patients => {
        const appointmentsWithPatient = appointmentsDetails.map((appointment, index) => {
          return {
            appointment: appointment,
            patient: patients[index]
          };
        });
     
        appointmentsWithPatient.sort((a, b) => {
          return new Date(a.appointment.datum) - new Date(b.appointment.datum);
        });
     
        appointmentsWithPatient.forEach(({ appointment, patient }) => {
          const appointmentItem = document.createElement("li");
          appointmentItem.innerHTML = `
            Pacijent: ${patient.ime} ${patient.prezime}<br>
            Datum i vreme: ${convertDateFormat(appointment.datum)}<br>
            Opis: ${appointment.opis}<br>
            <button class="updateAppointmentBtn" data-appointment-id="${toId(appointment.id)}">Ažuriraj</button>
            <button class="deleteAppointmentBtn" data-appointment-id="${toId(appointment.id)}">Obriši</button>
            `;
     
          const updateAppointmentBtn = appointmentItem.querySelector(".updateAppointmentBtn");
          updateAppointmentBtn.addEventListener("click", function () {
            const appointmentId = this.getAttribute("data-appointment-id");
            previousAppointmentsListContainer.innerHTML = "";
            handleUpdateAppointment(appointmentId, toId(patient.id));
          });
     
          const deleteAppointmentBtn = appointmentItem.querySelector(".deleteAppointmentBtn");
          deleteAppointmentBtn.addEventListener("click", function () {
            const appointmentId = this.getAttribute("data-appointment-id");
            handleDeleteAppointment(appointmentId);
          });
     
          appointmentList.appendChild(appointmentItem);
        });
      });
    })
    .catch(error => {
      console.error('Došlo je do greške pri dohvatanju ili prikazu termina:', error);
    });

    previousAppointmentsListContainer.appendChild(appointmentList);
  }

  function handleUpdateAppointment(appointmentId) {
    fetch(`http://localhost:5154/Pregled/${appointmentId}`)
      .then((response) => response.json())
      .then((appointment) => {
        document.getElementById("updateAppointmentId").value = appointmentId;
        const updateAppointmentDate = document.getElementById(
          "updateAppointmentDate"
        );
        updateAppointmentDate.addEventListener("change", function (event) {
          const newAppointmentDate = document.getElementById(
            "updateAppointmentDate"
          ).value;
          fetch(
            `http://localhost:5154/Pregled/availableTimeSlots/${doctorId}/${newAppointmentDate}`
          )
            .then((response) => response.json())
            .then((availableTimeSlots) => {
              availableTimeSlotsUI(availableTimeSlots);
            })
            .catch((error) => {
              console.error("Error fetching available time slots:", error);
            });
          console.log("Selected date:", event.target.value);
        });
        document.getElementById("updateAppointmentOpis").value =
          appointment.opis;

        document.getElementById("updateAppointmentForm").style.display =
          "block";
      })
      .catch((error) => {
        console.error("Fetch error:", error);
      });
  }

  function availableTimeSlotsUI(availableTimeSlots) {
    const newTimeSlotDropdown = document.getElementById("newTimeSlotDropdown");
    newTimeSlotDropdown.innerHTML = "";
    availableTimeSlots.forEach((timeSlot) => {
      const option = document.createElement("option");
      option.value = timeSlot;
      option.textContent = timeSlot;
      newTimeSlotDropdown.appendChild(option);
    });
  }

  function handleDeleteAppointment(appointmentId) {
    if (confirm("Da li ste sigurni da želite da obrišete ovaj pregled?")) {
      fetch(`http://localhost:5154/Pregled/${appointmentId}`, {
        method: "DELETE",
      })
        .then((response) => {
          if (!response.ok) {
            console.log(appointmentId);
            alert("Greška prilikom brisanja pregleda. Pokušajte ponovo!");
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
        })
        .then((data) => {
          alert("Pregled uspešno obrisan!");
          previousAppointmentsListContainer.innerHTML = "";
        })
        .catch((error) => {
          console.error("Fetch error:", error);
        });
    }
  }

  document
    .getElementById("updateAppointmentForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();

      const appointmentId = document.getElementById(
        "updateAppointmentId"
      ).value;
      const updatedDate = document.getElementById(
        "updateAppointmentDate"
      ).value;
      const updatedTime = document.getElementById("newTimeSlotDropdown").value;
      const updatedDateTime = updatedDate + "T" + updatedTime + "Z";
      const updatedOpis = document.getElementById(
        "updateAppointmentOpis"
      ).value;

      fetch(
        `http://localhost:5154/Pregled/${appointmentId}/${updatedDateTime}/${updatedOpis}`,
        {
          method: "PUT",
        }
      )
        .then((response) => {
          if (!response.ok) {
            alert("Greška prilikom ažuriranja pregleda. Pokušajte ponovo!");
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
        })
        .then((data) => {
          alert("Pregled uspešno ažuriran!");
          document.getElementById("updateAppointmentForm").style.display =
            "none";
        })
        .catch((error) => {
          console.error("Fetch error:", error);
        });
    });

  profileLink.addEventListener("click", function () {
    window.location.href = "../html/doktorProfil.html";
  });

  pocetnaLink.addEventListener("click", function () {
    window.location.href = "../html/index.html";
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
