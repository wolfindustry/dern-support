document.addEventListener("DOMContentLoaded", () => {
  // Modalni ochish
  document.getElementById("forum-btn").addEventListener("click", () => {
    document.getElementById("new-application-modal").style.display = "block";
  });

  // Modalni yopish
  document.getElementById("close").addEventListener("click", () => {
    document.getElementById("new-application-modal").style.display = "none";
  });

  // Bekor qilish
  document
    .getElementById("cancel-application-btn")
    .addEventListener("click", () => {
      const form = document.getElementById("new-application-form");
      form.reset();
      document.getElementById("company-name-group").style.display = "none";
      document.getElementById("new-application-modal").style.display = "none";
    });

  // Shaxs turi bo‘yicha kompaniya nomini ko‘rsatish
  document
    .getElementById("person-type")
    .addEventListener("change", function () {
      const companyNameGroup = document.getElementById("company-name-group");
      if (this.value === "legal") {
        companyNameGroup.style.display = "block";
        document
          .getElementById("company-name")
          .setAttribute("required", "required");
      } else {
        companyNameGroup.style.display = "none";
        document.getElementById("company-name").removeAttribute("required");
      }
    });

  // Ariza yuborish
  const li = document.getElementById("lili");
  if (li) {
    li.addEventListener("click", async (e) => {
      e.preventDefault();

      const email = document.getElementById("application-email").value;
      const personType = document.getElementById("person-type").value;
      const companyName = document.getElementById("company-name").value;
      const issueType = document.getElementById("issue-type").value;
      const description = document.getElementById("problem-description").value;
      const region = document.getElementById("location").value;
      const fname = document.getElementById("First-name").value;
      const lname = document.getElementById("Last-name").value;
      const dname = document.getElementById("d-name").value;
      const privacy = document.getElementById("privacy").checked;

      if (personType === "legal" && !companyName) {
        toastError("Iltimos, kompaniya nomini kiriting.");
        return;
      } else if (personType == "") {
        toastError("Siz shaxs turini tanlamadingiz");
        return;
      } else if (!privacy) {
        toastError("Iltimos, Mahfiylik siyosatiga rozilik belgilang.");
        return;
      } else if (email == "") {
        toastError("Siz gamilingizni kiritmadingiz");
        return;
      } else if (issueType == "") {
        toastError("Siz muammo turini kiritmadingiz");
        return;
      } else if (region == "") {
        toastError("Siz qaysi rayondanligingizni kiritmadingiz");
        return;
      } else if (fname == "") {
        toastError("Siz ismingizni kiritmadingiz");
        return;
      } else if (lname == "") {
        toastError("Siz familiyangizni kiritmadingiz");
        return;
      } else if (description == "") {
        toastError("Siz biror ta ham izoh kiritmadingiz");
        return;
      } else if (dname == "") {
        toastError("Siz qurilma nomini kiritmadingiz");
        return;
      }

      const data = {
        fname,
        lname,
        email,
        personType,
        companyName: personType === "legal" ? companyName : null,
        problemType: issueType,
        description,
        region: region,
        price: null,
        status: "Kutilmoqda",
        deviceName: dname,
        estimatedCompletionTime: null,
      };

      try {
        const response = await fetch(
          "https://sardor.robohouse.tech/api/submit",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          }
        );

        if (response.ok) {
          toastSuccess("Ariza yaratildi, emailingizga parol yuborildi");
          setTimeout(() => location.reload(), 1000);
        } else {
          toastError("Yuborishda xatolik yuz berdi.");
        }
      } catch (error) {
        console.error("Ariza yuborishda xato:", error);
        toastError("Xatolik: " + (error.message || "Qayta urinib ko‘ring."));
      }
    });
  }
});
