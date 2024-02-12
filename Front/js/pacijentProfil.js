document.addEventListener("DOMContentLoaded", function () {
  const profileLink = document.getElementById("profileLink");
  const logoutLink = document.getElementById("logoutLink");
  const showUpdateFormBtn = document.getElementById("showUpdateFormBtn");
  const updateProfileForm = document.getElementById("updateProfileForm");
  const patientNameSpan = document.getElementById("patientName");
  const patientEmailSpan = document.getElementById("patientEmail");
  const patientAdressSpan = document.getElementById("patientAdress");
  const patientPhoneNumberSpan = document.getElementById("patientPhoneNumber");
  const previousAppointmentsListBtn = document.getElementById("previousAppointmentsListBtn");
  const scheduleAppointmentBtn = document.getElementById("scheduleAppointmentBtn");
  const scheduleAppointmentForm = document.getElementById("scheduleAppointmentForm");
  const previousAppointmentsListContainer = document.getElementById("previousAppointmentsListContainer" );
  const lekarSelect = document.getElementById("lekarSelect");
  var token = localStorage.getItem("token");
  var userEmail = localStorage.getItem("email");
  var patientId;

  if (!token) {
    window.location.href = "../html/login.html";
  }

  fetch(`http://localhost:5154/Pacijent/GetPacijentByEmail/${userEmail}`)
    .then((response) => {
      if (!response.ok) {
        alert("Greška prilikom prikaza pacijenta!");
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      const id = data.id;
      patientId = toId(id);
      patientNameSpan.textContent = `${data.ime} ${data.prezime}`;
      patientEmailSpan.textContent = data.email;
      document.getElementById("newEmail").value = data.email;
      patientAdressSpan.textContent = data.adresa;
      document.getElementById("newAdresa").value = data.adresa;
      patientPhoneNumberSpan.textContent = data.brojTelefona;
      document.getElementById("newBrojTelefona").value = data.brojTelefona;
    })
    .catch((error) => {
      console.error("Fetch error:", error);
    });

  showUpdateFormBtn.addEventListener("click", function () {
    if (updateProfileForm.style.display === "block") {
      updateProfileForm.style.display = "none";
    } else {
      updateProfileForm.style.display = "block";
    }
  });

  updateProfileForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const newAdresa = document.getElementById("newAdresa").value;
    const newBrojTelefona = document.getElementById("newBrojTelefona").value;
    const newEmail = document.getElementById("newEmail").value;

    fetch(
      `http://localhost:5154/Pacijent/${userEmail}/${newAdresa}/${newBrojTelefona}/${newEmail}`,
      {
        method: "PUT",
      }
    )
      .then((response) => {
        if (!response.ok) {
          alert(
            "Greška prilikom ažuriranja informacija o pacijentu. Pokušajte ponovo!"
          );
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
      })
      .then((data) => {
        alert("Vaše informacije su uspešno ažurirane!");
        window.location.href = "../html/pacijentProfil.html";
      })
      .catch((error) => {
        console.error("Fetch error:", error);
      });
  });

  previousAppointmentsListBtn.addEventListener("click", function () {
    document.getElementById("updateAppointmentForm").style.display = "none";
    document.getElementById("updateProfileForm").style.display = "none";
    if (previousAppointmentsListContainer.innerHTML != "") {
      previousAppointmentsListContainer.innerHTML = "";
    } else {
      fetch(`http://localhost:5154/Pacijent/GetPacijentByEmail/${userEmail}`)
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          var appointments = data.istorijaPregleda;
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
        return fetch(`http://localhost:5154/Doktor/${toId(appointment.idDoktora)}`)
          .then(response => response.json());
      }))
      .then(doctors => {
        const appointmentsWithDoctors = appointmentsDetails.map((appointment, index) => {
          return {
            appointment: appointment,
            doctor: doctors[index]
          };
        });
     
        appointmentsWithDoctors.sort((a, b) => {
          return new Date(a.appointment.datum) - new Date(b.appointment.datum);
        });
     
        appointmentsWithDoctors.forEach(({ appointment, doctor }) => {
          const appointmentItem = document.createElement("li");
          appointmentItem.innerHTML = `
            Lekar: ${doctor.ime} ${doctor.prezime}<br>
            Datum i vreme: ${convertDateFormat(appointment.datum)}<br>
            Opis: ${appointment.opis}<br>
            <button class="updateAppointmentBtn" data-appointment-id="${toId(appointment.id)}">Ažuriraj</button>
            <button class="deleteAppointmentBtn" data-appointment-id="${toId(appointment.id)}">Obriši</button>
            `;
     
          const updateAppointmentBtn = appointmentItem.querySelector(".updateAppointmentBtn");
          updateAppointmentBtn.addEventListener("click", function () {
            const appointmentId = this.getAttribute("data-appointment-id");
            previousAppointmentsListContainer.innerHTML = "";
            handleUpdateAppointment(appointmentId, toId(doctor.id));
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

  scheduleAppointmentBtn.addEventListener("click", function () {
    if (scheduleAppointmentForm.style.display === "block") {
      scheduleAppointmentForm.style.display = "none";
    } else {
      scheduleAppointmentForm.style.display = "block";
    }
    fetch("http://localhost:5154/Doktor")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((doctors) => {
        doctors.forEach((doctor) => {
          const id = doctor.id;
          const option = document.createElement("option");
          option.value = toId(id);
          option.textContent = doctor.ime + " " + doctor.prezime;
          lekarSelect.appendChild(option);
        });
      })
      .catch((error) => {
        console.error("Fetch error:", error);
      });
  });

  const selectedSpecijalizacijaEvent = document.getElementById(
    "specijalizacijaDropdown"
  );
  selectedSpecijalizacijaEvent.addEventListener("click", function (event) {
    event.preventDefault();
    const selectedSpecijalizacija = document.getElementById(
      "specijalizacijaDropdown"
    ).value;
    fetch(
      `http://localhost:5154/Doktor/BySpecijalizacija/${selectedSpecijalizacija}`
    )
      .then((response) => response.json())
      .then((doctors) => {
        updateDoctorDropdown(doctors);
      })
      .catch((error) => {
        lekarSelect.innerHTML = "";
        alert("Ne postoji lekar sa izabranom specijalizacijom!");
        console.error("Fetch error:", error);
      });
  });

  function updateDoctorDropdown(doctors) {
    const lekarSelect = document.getElementById("lekarSelect");
    lekarSelect.innerHTML = "";

    doctors.forEach((doctor) => {
      const option = document.createElement("option");
      option.value = toId(doctor.id);
      option.textContent = doctor.ime + " " + doctor.prezime;
      lekarSelect.appendChild(option);
    });
  }

  scheduleAppointmentForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const lekar = document.getElementById("lekarSelect").value;
    const appointmentDate = document.getElementById("appointmentDate").value;
    const opis = document.getElementById("opis").value;
    const selectedTimeSlot = document.getElementById("timeSlotDropdown").value;
    const dateTimeString = appointmentDate + "T" + selectedTimeSlot + "Z";
    scheduleAppointment(lekar, dateTimeString, opis);
  });

  const appointmentDateInput = document.getElementById("appointmentDate");
  appointmentDateInput.addEventListener("change", function (event) {
    const lekar = document.getElementById("lekarSelect").value;
    const appointmentDate = document.getElementById("appointmentDate").value;
    fetch(
      `http://localhost:5154/Pregled/availableTimeSlots/${lekar}/${appointmentDate}`
    )
      .then((response) => response.json())
      .then((availableTimeSlots) => {
        updateAvailableTimeSlotsUI(availableTimeSlots);
      })
      .catch((error) => {
        console.error("Error fetching available time slots:", error);
      });
    console.log("Selected date:", event.target.value);
  });

  function updateAvailableTimeSlotsUI(availableTimeSlots) {
    const timeSlotDropdown = document.getElementById("timeSlotDropdown");
    timeSlotDropdown.innerHTML = "";
    availableTimeSlots.forEach((timeSlot) => {
      const option = document.createElement("option");
      option.value = timeSlot;
      option.textContent = timeSlot;
      timeSlotDropdown.appendChild(option);
    });
  }

  function scheduleAppointment(lekar, appointmentDate, opis) {
    console.log(appointmentDate);
    fetch(
      `http://localhost:5154/Pregled/schedule/${lekar}/${patientId}/${appointmentDate}/${opis}`,
      {
        method: "POST",
      }
    )
      .then((response) => {
        if (!response.ok) {
          alert("Greška prilikom zakazivanja pregleda!");
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
      })
      .then((result) => {
        console.log(result);
        alert("Pregled uspešno zakazan!");
        window.location.href = "../html/pacijentProfil.html";
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  function handleUpdateAppointment(appointmentId, doctorId) {
    fetch(`http://localhost:5154/Pregled/${appointmentId}`)
      .then((response) => response.json())
      .then((appointment) => {
        document.getElementById("updateAppointmentId").value = appointmentId;
        document.getElementById("updateAppointmentDate").value = appointment.datum.substring(0, 10);
        document.getElementById("newTimeSlotDropdown").value = appointment.datum.substring(11, 16);

        fetch(`http://localhost:5154/Pregled/availableTimeSlots/${doctorId}/${appointment.datum}`)
        .then((response) => response.json())
        .then((availableTimeSlots) => {
          availableTimeSlotsUI(availableTimeSlots);
        })
        .catch((error) => {
          console.error("Error fetching available time slots:", error);
        });


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

  const deleteProfileBtn = document.getElementById("deleteProfileBtn");

  deleteProfileBtn.addEventListener("click", function () {
    if (confirm("Da li ste sigurni da želite da obrišete svoj profil?")) {
      handleDeleteProfile();
    }
  });

  function handleDeleteProfile() {
    fetch(`http://localhost:5154/Pacijent/${patientId}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          alert("Greška prilikom brisanja profila. Pokušajte ponovo!");
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
      })
      .then((data) => {
        alert("Profil uspešno obrisan!");
        localStorage.removeItem("userRole");
        localStorage.removeItem("token");
        localStorage.removeItem("email");
        window.location.href = "../html/index.html";
      })
      .catch((error) => {
        console.error("Fetch error:", error);
      });
  }

  profileLink.addEventListener("click", function () {
    window.location.href = "../html/pacijentProfil.html";
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
