document.addEventListener("DOMContentLoaded", async () => {
  console.log("DOM yuklandi, kod ishga tushdi!");

  // Foydalanuvchi ma'lumotlarini tekshirish
  const userRole = localStorage.getItem("userRole");
  const userEmail = localStorage.getItem("userEmail");
  console.log("localStorage:", { userRole, userEmail });

  // Agar userRole yo'q bo'lsa yoki manager bo'lmasa, login sahifasiga yo'naltirish
  if (!userRole || userRole !== "manager") {
    console.log("Autentifikatsiya talab qilinadi yoki manager roli yo'q");
    toastError("Kirish uchun autentifikatsiya talab qilinadi.");
    setTimeout(() => {
      window.location.href = "/login";
    }, 1500);
    return;
  }

  // Emailni ko‘rsatish
  const emailElement = document.getElementById("user-email");
  console.log("Email elementi:", emailElement);
  if (emailElement && userEmail) {
    emailElement.textContent = userEmail;
    console.log("Email o'rnatildi:", userEmail);
  }

  // Diagrammalarni ishga tushirish
  initializeCharts();

  // Ma'lumotlarni yuklash
  try {
    console.log("Statistikani yuklash boshlandi...");
    await loadStatistics();
    console.log("Arizalarni yuklash boshlandi...");
    await loadSubmissions();
    console.log("Foydalanuvchilarni yuklash boshlandi...");
    await loadUsers();
  } catch (error) {
    console.error("Ma'lumotlarni yuklashda xatolik:", error);
    showError("Ma'lumotlarni yuklashda xatolik yuz berdi.");
  }

  // Navigatsiyani sozlash
  setupNavigation();

  // Logout knopkasi
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      console.log("Chiqish knopkasi bosildi");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userEmail");
      window.location.href = "/login";
    });
  }

  // Filtr va qidiruv hodisalarini sozlash
  setupFiltersAndSearch();

  // Forma yuborish hodisasini sozlash
  setupApplicationForm();
});

// Statistikani yuklash
async function loadStatistics() {
  console.log("fetch: /api/submission-stats");
  try {
    const res = await fetch(
      "https://sardor.robohouse.tech/api/api/submission-stats"
    );
    console.log("Javob:", res);
    const data = await res.json();
    console.log("Ma'lumotlar:", data);

    if (data.success) {
      document.getElementById("total-applications").textContent =
        data.stats?.total || 0;
      document.getElementById("total-products").textContent =
        data.stats?.waiting || 0;
      document.getElementById("in-progress").textContent =
        data.stats?.inProgress || 0;
      document.getElementById("completed").textContent =
        data.stats?.completed || 0;
      updateCharts(data);
    } else {
      showError(data.message || "Statistikani yuklashda xato.");
    }
  } catch (error) {
    console.error("Statistikani yuklashda xatolik:", error);
    showError("Statistikani yuklashda xato.");
  }
}

// Arizalarni yuklash
let allSubmissions = [];
async function loadSubmissions() {
  console.log("fetch: /api/all-submissions");
  try {
    const res = await fetch(
      "https://sardor.robohouse.tech/api/api/all-submissions"
    );
    console.log("Javob:", res);
    const data = await res.json();
    console.log("Ma'lumotlar:", data);

    const container = document.getElementById("all-submissions-container");
    if (!container) {
      console.warn("Arizalar konteyneri topilmadi.");
      return;
    }

    if (data.success && data.data?.length > 0) {
      allSubmissions = data.data;
      renderSubmissions(allSubmissions);
    } else {
      container.innerHTML = "<p>Hozircha hech qanday ariza yo'q.</p>";
    }
  } catch (error) {
    console.error("Arizalarni yuklashda xatolik:", error);
    showError("Arizalarni yuklashda xato.");
  }
}

// Arizalarni ko‘rsatish
function renderSubmissions(submissions) {
  const container = document.getElementById("all-submissions-container");
  container.innerHTML = "";

  if (submissions.length > 0) {
    submissions.forEach((app) => {
      const card = document.createElement("div");
      card.className = "submission-card";
      card.innerHTML = `
        <div class="card-header">
          <h3>${app.email}</h3>
          <span class="status ${app.status.toLowerCase()}">${app.status}</span>
        </div>
        <div class="card-body">
          <p><strong>Muammo:</strong> ${app.problemType || "N/A"}</p>
          <p><strong>Tavsif:</strong> ${app.description || "N/A"}</p>
          <p><strong>Hudud:</strong> ${app.region || "N/A"}</p>
          <p><strong>Qurilma:</strong> ${app.deviceName || "N/A"}</p>
          <p><strong>Narx:</strong> ${
            app.price ? `${app.price.toFixed(2)} ming` : "Hali Aniqlanmadi"
          } </p>
          <p><strong>Tugash vaqti (Taxminiy):</strong> ${
            app.estimatedCompletionTime
              ? new Date(app.estimatedCompletionTime).toLocaleDateString()
              : "Hali Aniqlanmadi"
          }</p>
        </div>
      `;
      container.appendChild(card);
    });
  } else {
    container.innerHTML = "<p>Arizalar topilmadi.</p>";
  }
}

// Foydalanuvchilarni yuklash
let allUsers = [];
async function loadUsers() {
  console.log("fetch: /api/all-users");
  try {
    const res = await fetch("https://sardor.robohouse.tech/api/api/all-users");
    console.log("Javob:", res);
    const data = await res.json();
    console.log("Ma'lumotlar:", data);

    const container = document.getElementById("all-users-container");
    if (!container) {
      console.warn("Foydalanuvchilar konteyneri topilmadi.");
      return;
    }

    if (data.success && data.data?.length > 0) {
      allUsers = data.data;
      renderUsers(allUsers);
    } else {
      container.innerHTML = "<p>Foydalanuvchilar topilmadi.</p>";
    }
  } catch (error) {
    console.error("Foydalanuvchilarni yuklashda xatolik:", error);
    showError("Foydalanuvchilarni yuklashda xato.");
  }
}

// Foydalanuvchilarni ko‘rsatish
function renderUsers(users) {
  const container = document.getElementById("all-users-container");
  container.innerHTML = "";

  if (users.length > 0) {
    users.forEach((user) => {
      const card = document.createElement("div");
      card.className = "user-card";
      card.innerHTML = `
        <h4>Email: ${user.email}</h4>
        <p><strong>Ism:</strong> ${user.fname || "N/A"}</p>
        <p><strong>Famailiya:</strong> ${user.lname || "N/A"}</p>
        <p><strong>Turi:</strong> ${user.personType || "N/A"}</p>
        ${
          user.personType == "legal"
            ? `<p><strong>Kompaniya:</strong> ${user.companyName}</p>`
            : ""
        }
        <p><strong>Ro‘yxatdan o‘tgan:</strong> ${new Date(
          user.time
        ).toLocaleDateString()}</p>
      `;
      container.appendChild(card);
    });
  } else {
    container.innerHTML = "<p>Foydalanuvchilar topilmadi.</p>";
  }
}

// Filtr va qidiruv hodisalarini sozlash
function setupFiltersAndSearch() {
  const statusFilter = document.getElementById("status-filter");
  if (statusFilter) {
    statusFilter.addEventListener("change", (e) => {
      const selectedStatus = e.target.value;
      const filteredSubmissions =
        selectedStatus === "all"
          ? allSubmissions
          : allSubmissions.filter((app) => app.status === selectedStatus);
      renderSubmissions(filteredSubmissions);
    });
  }

  const userSearch = document.getElementById("user-search");
  if (userSearch) {
    userSearch.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase().trim();
      const filteredUsers = allUsers.filter((user) => {
        const fullName = `${user.fname || ""} ${
          user.lname || ""
        }`.toLowerCase();
        return (
          user.email.toLowerCase().includes(query) || fullName.includes(query)
        );
      });
      renderUsers(filteredUsers);
    });
  }
}

// Forma yuborish hodisasini sozlash
function setupApplicationForm() {
  const applicationForm = document.getElementById("application-form");
  if (applicationForm) {
    applicationForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const submitButton = applicationForm.querySelector(".primary-btn");
      submitButton.textContent = "Yuborilmoqda";
      submitButton.disabled = true;

      const problemType = document.getElementById("issue-type").value;
      const description = document.getElementById("description").value.trim();
      const region = document.getElementById("location").value;
      const deviceName = document.getElementById("device-name").value.trim();
      const userEmail = document.getElementById("user-email").textContent;

      const applicationData = {
        email: userEmail,
        problemType,
        description,
        region,
        price: null,
        status: "Kutilmoqda",
        deviceName,
        estimatedCompletionTime: null,
      };

      try {
        console.log("fetch: /api/submit", applicationData);
        const response = await fetch(
          "https://sardor.robohouse.tech/api/api/submit",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(applicationData),
          }
        );

        console.log("Javob:", response);
        if (response.ok) {
          toastSuccess("Ariza muvaffaqiyatli yaratildi!");
          applicationForm.reset();
          // Arizalar bo‘limini yangilash
          await loadSubmissions();
          // Arizalar bo‘limiga o‘tish
          showSection("applications-content");
          setActiveNavItem("applications-link");
        } else {
          toastError("Ariza yuborishda xatolik yuz berdi.");
        }
      } catch (error) {
        console.error("Serverga ulanishda xatolik:", error);
        toastError("Serverga ulanishda xatolik yuz berdi.");
      } finally {
        submitButton.textContent = "Yuborish";
        submitButton.disabled = false;
      }
    });
  }
}

// Diagrammalarni ishga tushirish
function initializeCharts() {
  if (typeof Chart === "undefined") {
    console.error("Chart.js kutubxonasi yuklanmadi!");
    showError(
      "Chart.js kutubxonasi yuklanmadi. Internet aloqasini tekshiring."
    );
    return;
  }

  Chart.register(ChartDataLabels);

  const charts = [
    {
      id: "regionChart",
      type: "bar",
      dataset: {
        label: "Arizalar (Hududlar bo‘yicha)",
        backgroundColor: "rgba(52, 152, 219, 0.7)",
        borderColor: "rgba(52, 152, 219, 1)",
        borderWidth: 1,
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: "Hududlar bo‘yicha arizalar",
            font: { size: 18 },
          },
          datalabels: {
            anchor: "end",
            align: "top",
            color: "#2c3e50",
            font: { weight: "bold", size: 14 },
            formatter: (value) => value,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: "Arizalar soni" },
            grid: { display: false },
          },
          x: {
            title: { display: true, text: "Hududlar" },
            grid: { color: "#ecf0f1" },
          },
        },
      },
    },
    {
      id: "problemChart",
      type: "doughnut",
      dataset: {
        label: "Muammo turlari",
        backgroundColor: [
          "#e74c3c",
          "#3498db",
          "#9b59b6",
          "#f1c40f",
          "#2ecc71",
          "#e67e22",
        ],
        borderColor: "#fff",
        borderWidth: 2,
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "top", labels: { font: { size: 14 } } },
          title: {
            display: true,
            text: "Muammo turlari bo‘yicha taqsimot",
            font: { size: 18 },
          },
          datalabels: {
            color: "#fff",
            font: { weight: "bold", size: 14 },
            formatter: (value, ctx) => {
              const sum = ctx.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((value / sum) * 100).toFixed(1) + "%";
              return percentage;
            },
          },
        },
      },
    },
  ];

  charts.forEach(({ id, type, dataset, options }) => {
    const canvas = document.getElementById(id);
    if (!canvas) {
      console.warn(`Canvas elementi #${id} topilmadi.`);
      showError(`Canvas elementi #${id} topilmadi.`);
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.warn(`Canvas #${id} uchun 2D kontekst topilmadi.`);
      showError(`Canvas #${id} uchun 2D kontekst topilmadi.`);
      return;
    }
    try {
      window[id] = new Chart(ctx, {
        type,
        data: { labels: [], datasets: [{ ...dataset, data: [] }] },
        options,
      });
      console.log(`Diagramma #${id} muvaffaqiyatli ishga tushirildi.`);
    } catch (error) {
      console.error(`Diagramma #${id} ni ishga tushirishda xatolik:`, error);
      showError(`Diagramma #${id} ni yuklashda xato.`);
    }
  });
}

// Diagrammalarni yangilash
function updateCharts(data) {
  const charts = [
    {
      name: "regionChart",
      chart: window.regionChart,
      labels: data.regionStats ? Object.keys(data.regionStats) : [],
      data: data.regionStats ? Object.values(data.regionStats) : [],
    },
    {
      name: "problemChart",
      chart: window.problemChart,
      labels: data.problemStats ? Object.keys(data.problemStats) : [],
      data: data.problemStats ? Object.values(data.problemStats) : [],
    },
  ];

  charts.forEach(({ name, chart, labels, data }) => {
    if (chart && chart.data) {
      chart.data.labels = labels;
      chart.data.datasets[0].data = data;
      chart.update();
      console.log(`Diagramma ${name} muvaffaqiyatli yangilandi.`);
    } else {
      console.warn(`Diagramma ${name} obyekti topilmadi.`);
      showError(`Diagramma ${name} ni yangilashda xato.`);
    }
  });
}

// Navigatsiyani sozlash
function setupNavigation() {
  const navItems = [
    { id: "dashboard-link", section: "dashboard-content" },
    { id: "applications-link", section: "applications-content" },
    { id: "products-link", section: "products-content" },
    { id: "create-application-link", section: "create-application-content" },
  ];

  navItems.forEach(({ id, section }) => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener("click", (e) => {
        e.preventDefault();
        showSection(section);
        setActiveNavItem(id);
      });
    }
  });
}

// Bo‘limni ko‘rsatish
function showSection(sectionId) {
  const sections = document.querySelectorAll(".content-section");
  sections.forEach((section) => section.classList.remove("active"));

  const section = document.getElementById(sectionId);
  if (section) section.classList.add("active");
}

// Faol navigatsiya elementini belgilash
function setActiveNavItem(itemId) {
  const navItems = document.querySelectorAll(".sidebar-nav ul li");
  navItems.forEach((item) => item.classList.remove("active"));

  const item = document.getElementById(itemId);
  if (item) item.classList.add("active");
}

// Xato xabarini ko‘rsatish
function showError(message, title = "Xato") {
  if (window.showNotification) {
    window.showNotification("error", title, message);
  } else {
    console.warn("showNotification funksiyasi topilmadi, alert ishlatilmoqda.");
    alert(`${title}: ${message}`);
  }
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
