document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const profileLink = document.getElementById("profileLink");
  const logoutLink = document.getElementById("logoutLink");
  const loginLink = document.getElementById("loginLink");
  const registerLink = document.getElementById("registerLink");
  var token = localStorage.getItem("token");

  if (token) {
    isLoggedIn = true;
    updateUI();
    window.location.href = "../html/index.html";
  }

  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;
    localStorage.setItem("userRole", role);
    localStorage.setItem("email", email);
    const requestBody = {
      email: email,
      password: password,
    };
    if (role == "admin") {
      fetch("http://localhost:5154/api/AuthAdmin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })
        .then((response) => {
          if (!response.ok) {
            alert("Neuspešan login. Pokusajte ponovo!");
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log("Token:", data.token);
          token = data.token;
          localStorage.setItem("token", token);
          alert("Uspešan login!");
          updateUI();
          window.location.href = "../html/index.html";
        })
        .catch((error) => {
          console.error("Fetch error:", error);
        });
    } else if (role == "doctor") {
      fetch("http://localhost:5154/api/AuthDoc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })
        .then((response) => {
          if (!response.ok) {
            alert("Neuspešan login. Pokušajte ponovo!");
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log("Token:", data.token);
          token = data.token;
          localStorage.setItem("token", token);
          alert("Uspešan login!");
          updateUI();
          window.location.href = "../html/index.html";
        })
        .catch((error) => {
          console.error("Fetch error:", error);
        });
    } else {
      {
        fetch("http://localhost:5154/api/Auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        })
          .then((response) => {
            if (!response.ok) {
              alert("Neuspešan login. Pokušajte ponovo!");
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
          })
          .then((data) => {
            console.log(data);
            token = data.token;
            localStorage.setItem("token", token);
            alert("Uspešan login!");
            updateUI();
            window.location.href = "../html/index.html";
          })
          .catch((error) => {
            console.error("Fetch error:", error);
          });
      }
    }

    updateUI();
  });

  logoutLink.addEventListener("click", function () {
    localStorage.removeItem("userRole");
    localStorage.removeItem("token");
    localStorage.removeItem("email", email);
    updateUI();
  });

  pocetna.addEventListener("click", function () {
    window.location.href = "../html/index.html";
  });

  function updateUI() {
    const t = localStorage.getItem("token");

    if (t) {
      loginLink.style.display = "none";
      registerLink.style.display = "none";
      profileLink.style.display = "inline-block";
      logoutLink.style.display = "inline-block";
    } else {
      loginLink.style.display = "inline-block";
      registerLink.style.display = "inline-block";
      profileLink.style.display = "none";
      logoutLink.style.display = "none";
    }
  }

  pocetna.addEventListener("click", function () {
    window.location.href = "../html/index.html";
  });

  loginLink.addEventListener("click", function () {
    window.location.href = "../html/login.html";
  });

  registerLink.addEventListener("click", function () {
    window.location.href = "../html/registracija.html";
  });
});
