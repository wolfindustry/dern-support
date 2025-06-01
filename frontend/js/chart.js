async function loadAllSubmissions() {
  try {
    const res = await fetch("http://localhost:3000/api/all-submissions");
    const data = await res.json();

    if (data.success) {
      // Statistikani ko‘rsatish
      document.getElementById("total-applications").textContent =
        data.stats.total;
      document.getElementById("total-products").textContent =
        data.stats.waiting;
      document.getElementById("in-progress").textContent =
        data.stats.inProgress;
      document.getElementById("completed").textContent = data.stats.completed;

      const container = document.getElementById("all-submissions-container");
      container.innerHTML = "";
      console.log(data);

      if (data.data.length > 0) {
        data.data.forEach((app) => {
          const card = document.createElement("div");
          card.className = "submission-card";
          card.innerHTML = `
              <div class="card-header">
                <h3>${app.email}</h3>
                <span class="status ${app.status.toLowerCase()}">${
            app.status
          }</span>
              </div>
              <div class="card-body">
                <p><strong>Muammo:</strong> ${app.problemType}</p>
                <p><strong>Tavsif:</strong> ${app.description}</p>
                <p><strong>Hudud:</strong> ${app.region}</p>
                ${
                  app.companyName
                    ? `<p><strong>Kompaniya:</strong> ${app.companyName}</p>`
                    : ""
                }
              </div>
            `;
          container.appendChild(card);
        });
      } else {
        container.innerHTML = "<p>Hozircha hech qanday ariza yo'q.</p>";
      }
    }
  } catch (error) {
    console.error("Barcha arizalarni olishda xatolik:", error);
  }
}

ccess) {
      // Hududlar chart
      const regionCtx = document.getElementById("regionChart").getContext("2d");
      new Chart(regionCtx, {
        type: "bar",
        data: {
          labels: Object.keys(data.regionStats),
          datasets: [
            {
              label: "Arizalar sasync function loadSubmissionStats() {
  try {
    const res = await fetch("http://localhost:3000/api/submission-stats");
    const data = await res.json();

    if (data.suoni (Hududlar bo‘yicha)",
              data: Object.values(data.regionStats),
              backgroundColor: "rgba(54, 162, 235, 0.6)",
              borderColor: "rgba(54, 162, 235, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });

      // Muammo turlari chart
      const problemCtx = document
        .getElementById("problemChart")
        .getContext("2d");
      new Chart(problemCtx, {
        type: "pie",
        data: {
          labels: Object.keys(data.problemStats),
          datasets: [
            {
              label: "Muammo turlari",
              data: Object.values(data.problemStats),
              backgroundColor: [
                "#ff6384",
                "#36a2eb",
                "#cc65fe",
                "#ffce56",
                "#4bc0c0",
                "#9966ff",
              ],
            },
          ],
        },
        options: {
          responsive: true,
        },
      });
    }
  } catch (error) {
    console.error("Statistikani olishda xatolik:", error);
  }
}

async function loadAllUsers() {
  try {
    const res = await fetch("http://localhost:3000/api/all-users");
    const data = await res.json();
    console.log(data);

    const container = document.getElementById("all-users-container");
    container.innerHTML = "";

    if (data.success && data.data.length > 0) {
      data.data.forEach((user) => {
        const card = document.createElement("div");
        card.className = "submission-zzz";
        card.innerHTML = `
          <h4>Email: ${user.email}</h4>
          <p><strong>Ro‘yxatdan o‘tgan:</strong> ${new Date(
            user.time
          ).toLocaleDateString()}</p>
        `;
        container.appendChild(card);
      });
    } else {
      container.innerHTML = "<p>Foydalanuvchilar topilmadi.</p>";
    }
  } catch (error) {
    console.error("Foydalanuvchilarni olishda xatolik:", error);
  }
}

const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    window.location.href = "/login";
  });
}

c;
