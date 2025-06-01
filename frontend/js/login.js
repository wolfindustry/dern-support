document.addEventListener("DOMContentLoaded", () => {
  // Tab switching
  const clientTab = document.getElementById("client-tab");
  const masterTab = document.getElementById("master-tab");
  const managerTab = document.getElementById("manager-tab");
  const clientLogin = document.getElementById("client-login");
  const masterLogin = document.getElementById("master-login");
  const managerLogin = document.getElementById("manager-login");

  clientTab.addEventListener("click", () => {
    clientTab.classList.add("active");
    masterTab.classList.remove("active");
    managerTab.classList.remove("active");
    clientLogin.classList.add("active");
    masterLogin.classList.remove("active");
    managerLogin.classList.remove("active");
  });

  masterTab.addEventListener("click", () => {
    masterTab.classList.add("active");
    clientTab.classList.remove("active");
    managerTab.classList.remove("active");
    masterLogin.classList.add("active");
    clientLogin.classList.remove("active");
    managerLogin.classList.remove("active");
  });

  managerTab.addEventListener("click", () => {
    managerTab.classList.add("active");
    clientTab.classList.remove("active");
    masterTab.classList.remove("active");
    managerLogin.classList.add("active");
    clientLogin.classList.remove("active");
    masterLogin.classList.remove("active");
  });

  // Client login form submission
  const clientLoginForm = document.getElementById("client-login-form");
  clientLoginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("client-email").value;
    const password = document.getElementById("client-password").value;

    try {
      const response = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        toastSuccess("Tizimga muvaffaqiyatli kirdingiz", "Welcome");
        localStorage.setItem("userRole", "client");
        localStorage.setItem("userEmail", email);
        localStorage.setItem('userFulln', data.name)

        setTimeout(() => {
          window.location.href = "/client";
        }, 1000);
      } else {
        toastError(data.message || "Login xatosi");
      }
    } catch (error) {
      console.error("Login so‘rovda xatolik:", error);
      showError("Server bilan bog‘lanishda xatolik");
    }
});

  // Manager login form submission
  const manLoginForm = document.getElementById("manager-login-form");
  manLoginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("manager-email").value;
    const password = document.getElementById("manager-password").value;

    

    try {

      const response = await fetch("http://localhost:3000/api/manager-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const info = await response.json();

      if (info.success) {
       
        localStorage.setItem("userRole", "manager");
        localStorage.setItem("userEmail", email);

        setTimeout(() => {
          window.location.href = "/manager";
        }, 1500);

        toastSuccess(
          'Muvaffaqiyatli royhatdan otdingiz'
        );

      } else {
        toastError("Email yoki parol natogri");
      }
    } catch (error) {
      console.error("Error during master login:", error);
      toastError("Serverda xatolik yuz berdi, yana bir urunib koring");
    }
  });

  const masLoginForm = document.getElementById("master-login-form");
  masLoginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("master-email").value;
    const password = document.getElementById("master-password").value;

    

    try {

      const response = await fetch("http://localhost:3000/api/master-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const info = await response.json();

      if (info.success) {
       
        localStorage.setItem("userRole", "master");
        localStorage.setItem("userEmail", email);

        setTimeout(() => {
          window.location.href = "/master";
        }, 1500);

        toastSuccess(
          'Muvaffaqiyatli royhatdan otdingiz'
        );

      } else {
        toastError("Email yoki parol natogri");
      }
    } catch (error) {
      console.error("Error during master login:", error);
      toastError("Serverda xatolik yuz berdi, yana bir urunib koring");
    }
  });

  // Manager login form submission
  const managerLoginForm = document.getElementById("manager-login-form");
  managerLoginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // const email = document.getElementById("manager-email").value;
    // const password = document.getElementById("manager-password").value;

    try {
      // Simple validation (in a real app, this would be done on the server)
      if (email === "manager@techfix.com" && password === "password") {
        // Create a token (in a real app, this would come from the server)
        const token = btoa(`manager:${email}:${Date.now()}`);

        // Store token in localStorage
        localStorage.setItem("authToken", token);
        localStorage.setItem("userRole", "manager");
        localStorage.setItem("userEmail", email);

        // Show success notification
        showSuccess("Login successful. Redirecting to dashboard...", "Welcome");

        // Redirect to manager cabinet
        setTimeout(() => {
          window.location.href = "/manager-cabinet.html";
        }, 1500);
      } else {
        showError("Invalid email or password");
      }
    } catch (error) {
      console.error("Error during manager login:", error);
      showError("An error occurred. Please try again.");
    }
  });

  // Check if token exists and redirect if valid
  const token = localStorage.getItem("authToken");
  const userRole = localStorage.getItem("userRole");

  if (token && userRole) {
    // Redirect based on user role
    if (userRole === "client") {
      window.location.href = "/client-cabinet.html";
    } else if (userRole === "master") {
      window.location.href = "/master-cabinet.html";
    } else if (userRole === "manager") {
      window.location.href = "/manager-cabinet.html";
    }
  }
});




