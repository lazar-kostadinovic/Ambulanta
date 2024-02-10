document.addEventListener("DOMContentLoaded", function () {
  const loginLink = document.getElementById("loginLink");
  const registerLink = document.getElementById("registerLink");
  const profileLink = document.getElementById("profileLink");
  const logoutLink = document.getElementById("logoutLink");
  const token = localStorage.getItem("token");
  console.log(token);
  const userRole = localStorage.getItem("userRole");
  console.log(userRole);
  let isLoggedIn = false;
  if (token) {
    isLoggedIn = true;
  }

  if (isLoggedIn) {
    loginLink.style.display = "none";
    registerLink.style.display = "none";
    profileLink.style.display = "inline";
    logoutLink.style.display = "inline";
  } else {
    loginLink.style.display = "inline";
    registerLink.style.display = "inline";
    profileLink.style.display = "none";
    logoutLink.style.display = "none";
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

  profileLink.addEventListener("click", function () {
    switch (userRole) {
      case "doctor":
        window.location.href = "../html/doktorProfil.html";
        break;
      case "patient":
        window.location.href = "../html/pacijentProfil.html";
        break;
      case "admin":
        window.location.href = "../html/adminProfil.html";
        break;
      default:
        console.error("Invalid user role");
    }
  });

  logoutLink.addEventListener("click", function () {
    localStorage.removeItem("userRole");
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    window.location.href = "../html/index.html";
  });
});
