document.addEventListener("DOMContentLoaded", () => {
  const userRole = localStorage.getItem("userRole");
  const mail = localStorage.getItem("userEmail");
  const usern = localStorage.getItem("userFulln");

  if (userRole !== "client") {
    // No token found or not a client, redirect to login
    window.location.href = "/login";
    return;
  }

  const LocalHost = "https://sardor.robohouse.tech/api/";

  if (mail == null) {
    toastError("Siz tizimga kirmagansiz yoki royhtdan otmagansiz");
    setTimeout(() => {
      window.location.href = "/login";
    }, 2000);
  }

  // Set user email in header
  if (mail && usern) {
    document.getElementById("user-email").textContent = mail;
    document.getElementById("user-name").textContent = usern;
  }

  // DOM elementlarini olish
  const submitLink = document.getElementById("submit-application-link");
  const myAppsLink = document.getElementById("my-applications-link");
  const changePas = document.getElementById("change-password");
  const changePasCon = document.getElementById("change-password-container");
  const submitContent = document.getElementById("submit-application-content");
  const myAppsContent = document.getElementById("my-applications-content");
  const logoutBtn = document.getElementById("logout-btn");
  const userEmailSpan = document.getElementById("user-email");

  // Foydalanuvchi emailini chiqarish (agar localStorage'da bo‘lsa)
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  if (user && user.email) {
    userEmailSpan.textContent = user.email;
  }

  // Ekranlarni almashtirish funksiyasi
  function showSection(section) {
    // Hamma content'larni yashirish
    document.querySelectorAll(".content-section").forEach((el) => {
      el.classList.remove("active");
    });

    // Aktiv linkni yangilash
    document.querySelectorAll(".sidebar-nav li").forEach((el) => {
      el.classList.remove("active");
    });

    // So‘ralgan sectionni ko‘rsatish
    if (section === "submit") {
      submitContent.classList.add("active");
      submitLink.classList.add("active");
    } else if (section === "my-apps") {
      myAppsContent.classList.add("active");
      myAppsLink.classList.add("active");
    } else if (section === "change") {
      changePasCon.classList.add("active");
      changePas.classList.add("active");
    }
  }

  // Linklarga bosilganda ishlaydigan hodisalar
  submitLink.addEventListener("click", (e) => {
    e.preventDefault();
    showSection("submit");
  });

  myAppsLink.addEventListener("click", (e) => {
    e.preventDefault();
    showSection("my-apps");
  });

  changePas.addEventListener("click", (e) => {
    e.preventDefault();
    showSection("change");
  });

  // const clientTypeSelect = document.getElementById("client-type");
  // const companyNameGroup = document.getElementById("company-name-group");

  // clientTypeSelect.addEventListener("change", () => {
  //   if (clientTypeSelect.value === "company") {
  //     companyNameGroup.style.display = "block";
  //     document
  //       .getElementById("company-name")
  //       .setAttribute("required", "required");
  //   } else {
  //     companyNameGroup.style.display = "none";
  //     document.getElementById("company-name").removeAttribute("required");
  //   }
  // });

  document
    .getElementById("application-form")
    .addEventListener("submit", async function (e) {
      e.preventDefault(); // sahifa yangilanishining oldini olamiz

      // Ma'lumotlarni yig'ib olamiz
      // const personType = document.getElementById("client-type").value;
      // const companyName = document.getElementById("company-name").value.trim();
      const problemType = document.getElementById("issue-type").value;
      const description = document.getElementById("description").value.trim();
      const region = document.getElementById("location").value;
      const dname = document.getElementById("device-name").value;
      const userEmail = document.getElementById("user-email").textContent; // foydalanuvchi emaili (agar kerak bo‘lsa)

      if (dname == "") {
        toastError("Siz qurilma nomini kiritmadingiz");
        return;
      }

      const submitButton = document.getElementById("primary-btn");
      submitButton.textContent = "Yuborilmoqda";
      submitButton.disabled = true;

      // Yuboriladigan obyekt
      const applicationData = {
        email: userEmail,
        problemType,
        description,
        region,
        price: null,
        status: "Kutilmoqda",
        deviceName: dname,
        estimatedCompletionTime: null,
      };

      try {
        const response = await fetch(`${LocalHost}api/submit`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(applicationData),
        });

        if (response.ok) {
          toastSuccess("Ma'lumot muvaffaqiyatli yuborildi!");
          document.getElementById("application-form").reset();
          document.getElementById("company-name-group").style.display = "none";
        } else {
          toastError("Ariza yuborishda xatolik yuz berdi.");
        }
      } catch (error) {
        console.error("Serverga ulanishda xatolik:", error);
        alert("Serverga ulanishda xatolik yuz berdi.");
      } finally {
        submitButton.textContent = "Yuborish";
        submitButton.disabled = false;
      }
    });

  // Applicationlarni olish va chiqarish
  async function loadUserApplications() {
    const container = document.getElementById("applications-list");
    container.innerHTML = "<p>Yuklanmoqda...</p>";

    try {
      const response = await fetch(
        `${LocalHost}api/applications?email=${encodeURIComponent(mail)}`
      );
      if (!response.ok) throw new Error("Ma'lumotlarni olishda xatolik");

      const data = await response.json();

      // Email bo‘yicha filterlash
      const userApps = data.filter((app) => app.email === mail);

      if (userApps.length === 0) {
        container.innerHTML = "<p>Sizda hech qanday ariza mavjud emas.</p>";
        return;
      }

      // Card'larni chiqarish
      container.innerHTML = "";
      userApps.forEach((app) => {
        const card = document.createElement("div");
        card.className = "application-card";
        card.innerHTML = `
        <div class="card-header">
           <h3>${app.deviceName}</h3>
           <span class="status ${app.status.toLowerCase()}">${app.status}</span>
        </div>
        <p><strong>Muammo Turi:</strong> ${app.problemType}</p>
        <p><strong>Tavsif:</strong> ${app.description}</p>
        <p><strong>Hudud:</strong> ${app.region}</p>
        ${
          app.companyName
            ? `<p><strong>Kompaniya:</strong> ${app.companyName}</p>`
            : ""
        }
        ${
          app.price
            ? `<p><strong>Narx:</strong> ${app.price.toFixed(2)} ming</p>`
            : ""
        }
        
        ${
          app.estimatedCompletionTime
            ? `<p><strong>Tugash Vaqti(Taxminiy):</strong> ${new Date(
                app.estimatedCompletionTime
              ).toLocaleDateString()}</p> `
            : ""
        }
      `;
        container.appendChild(card);
      });
    } catch (error) {
      console.error(error);
      container.innerHTML = "<p>Xatolik yuz berdi. Qayta urinib ko‘ring.</p>";
    }
  }

  myAppsLink.addEventListener("click", (e) => {
    e.preventDefault();
    showSection("my-apps");
    loadUserApplications(); // 👈 bu qo‘shilishi kerak
  });

  // Logout qilish
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userFulln");
    window.location.href = "login.html"; // login sahifangiz nomi shu bo‘lsa
  });
});

// Burger menyusini sozlash
const burgerMenu = document.getElementById("burger-menu");
const sidebar = document.getElementById("sidebar");
if (burgerMenu && sidebar) {
  burgerMenu.addEventListener("click", () => {
    sidebar.classList.toggle("active");
    console.log(
      "Burger menyusi bosildi, sidebar faol:",
      sidebar.classList.contains("active")
    );
  });

  // Navigatsiya elementlari bosilganda sidebar yopilishi
  const navLinks = document.querySelectorAll(".sidebar-nav ul li a");
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      sidebar.classList.remove("active");
      console.log("Navigatsiya elementi bosildi, sidebar yopildi");
    });
  });

  // Tashqarida bosilganda sidebar yopilishi
  document.addEventListener("click", (e) => {
    if (
      !sidebar.contains(e.target) &&
      !burgerMenu.contains(e.target) &&
      sidebar.classList.contains("active")
    ) {
      sidebar.classList.remove("active");
      console.log("Tashqarida bosildi, sidebar yopildi");
    }
  });
}
