let allApplications = []; // Arizalar uchun global o‘zgaruvchi

// Tasdiqlash funksiyasi
async function confirmApplication(applicationId) {
  try {
    const response = await fetch("/api/confirm-application", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ applicationId }),
    });

    const result = await response.json();
    if (response.ok) {
      toastSuccess("Ariza tasdiqlandi va mijozga xabar yuborildi!");
      loadApplications(); // Arizalarni qayta yuklash
    } else {
      toastError(result.message || "Tasdiqlashda xatolik");
    }
  } catch (error) {
    console.error("Ariza tasdiqlashda xato:", error);
    toastError("Server bilan bog‘lanishda xatolik");
  }
}

// Arizalarni serverdan yuklash
async function loadApplications() {
  try {
    const response = await fetch("/api/master-applications");
    if (!response.ok) {
      throw new Error(`API xatosi: ${response.status}`);
    }
    allApplications = await response.json();
    console.log("Yuklangan arizalar:", allApplications);

    // Barcha arizalarni ko‘rsatish
    displayApplications(allApplications, "applications-container");

    // Faqat tugallangan arizalarni dashboard’da ko‘rsatish
    const completedApplications = allApplications.filter(
      (app) => app.status?.trim() === "Tugallangan"
    );
    console.log("Tugallangan arizalar:", completedApplications); // Debug uchun
    if (completedApplications.length === 0) {
      console.warn("Hech qanday tugallangan ariza topilmadi!");
    }
    displayApplications(
      completedApplications,
      "completed-submissions-container"
    );

    // Statistikani yangilash
    updateDashboardStats(allApplications);
  } catch (error) {
    console.error("Arizalarni yuklashda xato:", error);
    showError("Arizalarni yuklashda xatolik");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Foydalanuvchi roli va email’ni localStorage’dan olish
  const userRole = localStorage.getItem("userRole");
  const userEmail = localStorage.getItem("userEmail");

  if (userRole !== "master") {
    window.location.href = "/login";
    return;
  }

  // Header’da email’ni ko‘rsatish
  if (userEmail) {
    document.getElementById("user-email").textContent = userEmail;
  }

  // Arizalarni yuklash
  loadApplications();

  // Navigatsiyani sozlash
  setupNavigation();

  // Form yuborishni sozlash
  setupFormSubmissions();

  // Chiqish tugmasini sozlash
  document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    window.location.href = "/login";
  });

  // Modalni yopish tugmalarini sozlash
  const closeButtons = document.querySelectorAll(".close");
  closeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const modal = this.closest(".modal");
      modal.style.display = "none";
    });
  });

  // Modal tashqarisida bosilganda yopish
  window.addEventListener("click", (event) => {
    const modals = document.querySelectorAll(".modal");
    modals.forEach((modal) => {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    });
  });

  // Baholashni bekor qilish tugmasi
  document
    .getElementById("cancel-evaluation-btn")
    .addEventListener("click", () => {
      document.getElementById("evaluation-form").reset();
      document.getElementById("evaluation-modal").style.display = "none";
    });

  // Kalendar kiritishni sozlash (faqat kalendar orqali)
  const dateInput = document.getElementById("estimated-completion-time");
  if (dateInput) {
    dateInput.addEventListener("keydown", (e) => {
      e.preventDefault();
    });
    dateInput.addEventListener("paste", (e) => {
      e.preventDefault();
    });
    dateInput.addEventListener("click", () => {
      try {
        dateInput.showPicker();
      } catch (error) {
        console.error("Kalendar ochishda xato:", error);
      }
    });
    dateInput.addEventListener("focus", () => {
      try {
        dateInput.showPicker();
      } catch (error) {
        console.error("Kalendar ochishda xato:", error);
      }
    });
  }

  // Status filtrlashni sozlash
  const statusFilter = document.getElementById("status-filter");
  if (statusFilter) {
    statusFilter.addEventListener("change", (e) => {
      const selectedStatus = e.target.value;
      console.log("Tanlangan filtr:", selectedStatus);
      filterApplications(selectedStatus);
    });
  }

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
});

// Arizalarni status bo‘yicha filtrlash
function filterApplications(status) {
  const filteredApplications =
    status === "all"
      ? allApplications
      : allApplications.filter((app) => app.status?.trim() === status);

  displayApplications(filteredApplications, "applications-container");
}

// Navigatsiyani sozlash
function setupNavigation() {
  document.getElementById("dashboard-link").addEventListener("click", (e) => {
    e.preventDefault();
    showSection("dashboard-content");
    setActiveNavItem("dashboard-link");
  });

  document
    .getElementById("applications-link")
    .addEventListener("click", (e) => {
      e.preventDefault();
      showSection("applications-content");
      setActiveNavItem("applications-link");
    });
}

// Bo‘limni ko‘rsatish va boshqalarni yashirish
function showSection(sectionId) {
  const sections = document.querySelectorAll(".content-section");
  sections.forEach((section) => {
    section.classList.remove("active");
  });

  document.getElementById(sectionId).classList.add("active");
}

// Faol navigatsiya elementini belgilash
function setActiveNavItem(itemId) {
  const navItems = document.querySelectorAll(".sidebar-nav ul li");
  navItems.forEach((item) => {
    item.classList.remove("active");
  });

  document.getElementById(itemId).classList.add("active");
}

// Form yuborishni sozlash
function setupFormSubmissions() {
  const evaluationForm = document.getElementById("evaluation-form");
  if (evaluationForm) {
    evaluationForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const applicationId = document.getElementById("application-id").value;
      const price = Number.parseFloat(
        document.getElementById("estimated-price").value
      );
      const estimatedCompletionTime = document.getElementById(
        "estimated-completion-time"
      ).value;

      console.log("Baholash yuborilmoqda:", {
        applicationId,
        price,
        estimatedCompletionTime,
      });

      try {
        const response = await fetch("/api/save-evaluation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            applicationId,
            price,
            estimatedCompletionTime,
          }),
        });

        const result = await response.json();
        if (response.ok) {
          toastSuccess("Baholash muvaffaqiyatli saqlandi!");
          evaluationForm.reset();
          document.getElementById("evaluation-modal").style.display = "none";
          loadApplications();
        } else {
          toastError(result.message || "Xatolik yuz berdi");
        }
      } catch (error) {
        console.error("Baholashni saqlashda xato:", error);
        toastError("Server bilan bog‘lanishda xatolik");
      }
    });
  }
}

// Arizalarni ko‘rsatish
function displayApplications(applications, containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Konteyner topilmadi: ${containerId}`);
    return;
  }

  // Mavjud kontentni tozalash
  container.innerHTML = "";

  // Agar arizalar bo‘lmasa, xabar ko‘rsatish
  if (applications.length === 0) {
    const noApplicationsMessage = document.createElement("div");
    noApplicationsMessage.className = "no-applications-message";
    noApplicationsMessage.innerHTML = `
            <i class="fas fa-clipboard-list"></i>
            <p>Hech qanday ariza topilmadi.</p>
        `;
    container.appendChild(noApplicationsMessage);
    console.log(`Konteynerda arizalar yo‘q: ${containerId}`);
    return;
  }

  // Ariza kartalarini yaratish va qo‘shish
  applications.forEach((application) => {
    const applicationCard = createApplicationCard(application);
    container.appendChild(applicationCard);
  });
  console.log(
    `Arizalar ko‘rsatildi: ${containerId}, soni: ${applications.length}`
  );
}

// Ariza kartasini yaratish
function createApplicationCard(application) {
  const card = document.createElement("div");
  card.className = `application-card ${
    application.status?.toLowerCase() || "kutilmoqda"
  }`;
  card.dataset.id = application._id;

  // Sanani formatlash
  const formatDate = (dateString) => {
    if (!dateString || isNaN(new Date(dateString).getTime()))
      return "Mavjud emas";
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };
  const completionDate = formatDate(application.estimatedCompletionTime);

  // Narxni xavfsiz formatlash
  const formatPrice = (price) => {
    if (typeof price === "number" && !isNaN(price)) {
      return `${price.toFixed(2)} ming`;
    }
    return "Mavjud emas";
  };

  // Karta HTML’ni yaratish
  card.innerHTML = `
    <div class="card-header">
      <h3>${application.email || "Noma’lum email"}</h3>
      <span class="status ${
        application.status?.toLowerCase() || "kutilmoqda"
      }">${application.status || "Kutilmoqda"}</span>
    </div>
    <div class="card-body">
      <p><strong>Qurilma:</strong> ${
        application.deviceName || application.problemType || "Noma’lum"
      }</p>
      <p><strong>Muammo:</strong> ${application.problemType || "Noma’lum"}</p>
      <p><strong>Tavsif:</strong> ${
        application.description || "Tavsif yo‘q"
      }</p>
      <p><strong>Hudud:</strong> ${application.region || "Noma’lum"}</p>
      ${
        application.companyName
          ? `<p><strong>Kompaniya:</strong> ${application.companyName}</p>`
          : ""
      }
      ${
        application.price != null
          ? `<p><strong>Narx:</strong> ${formatPrice(
              application.price
            )}</p>`
          : ""
      }
      ${
        application.estimatedCompletionTime
          ? `<p><strong>Tugash vaqti (Taxminiy):</strong> ${completionDate}</p>`
          : ""
      }
      ${
        application.price != null &&
        application.estimatedCompletionTime &&
        application.status !== "Tugallangan"
          ? `<button class="confirm-btn" data-id="${application._id}">Tasdiqlash</button>`
          : ""
      }
    </div>
  `;

  // Baholash modalini ochish uchun hodisa (faqat "Tugallangan" bo‘lmagan arizalar uchun)
  if (application.status !== "Tugallangan") {
    card.addEventListener("click", (e) => {
      if (!e.target.classList.contains("confirm-btn")) {
        openEvaluationModal(application);
      }
    });
  }

  // Tasdiqlash tugmasi uchun hodisa
  const confirmBtn = card.querySelector(".confirm-btn");
  if (confirmBtn) {
    confirmBtn.addEventListener("click", () => {
      console.log("Tasdiqlash tugmasi bosildi, ariza ID:", application._id);
      confirmApplication(application._id);
    });
  }

  return card;
}

// Baholash modalini ochish
function openEvaluationModal(application) {
  // Forma maydonlarini to‘ldirish
  document.getElementById("application-id").value = application._id || "";
  document.getElementById("device-name").value =
    application.deviceName || application.problemType || "";
  document.getElementById("problem-type").value = application.problemType || "";
  document.getElementById("description").value = application.description || "";
  document.getElementById("estimated-price").value =
    typeof application.price === "number"
      ? application.price
      : "";

  // Sana xavfsiz tekshirish
  let dateValue = "";
  if (
    application.estimatedCompletionTime &&
    !isNaN(new Date(application.estimatedCompletionTime).getTime())
  ) {
    dateValue = new Date(application.estimatedCompletionTime)
      .toISOString()
      .split("T")[0];
  }
  document.getElementById("estimated-completion-time").value = dateValue;
  console.log("Modal ochildi, tugash sanasi:", dateValue);

  // Modalni ko‘rsatish
  document.getElementById("evaluation-modal").style.display = "block";
}

// Dashboard statistikasini yangilash
function updateDashboardStats(applications) {
  applications = applications || [];

  // Umumiy arizalar soni
  const totalCount = applications.length;
  document.getElementById("total-applications").textContent = totalCount;

  // Jarayondagi arizalar soni
  const inProgressCount = applications.filter(
    (application) => application.status?.trim() === "Jarayonda"
  ).length;
  document.getElementById("in-progress").textContent = inProgressCount;

  // Tugallangan arizalar soni
  const completedCount = applications.filter(
    (application) => application.status?.trim() === "Tugallangan"
  ).length;
  document.getElementById("completed").textContent = completedCount;
}

// Muvaffaqiyat xabari
function showSuccess(message, title = "Muvaffaqiyat") {
  alert(`${title}: ${message}`);
}

// Xato xabari
function showError(message, title = "Xato") {
  alert(`${title}: ${message}`);
}
