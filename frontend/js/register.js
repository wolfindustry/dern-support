const btn = document.getElementById("sendBtn");

document.getElementById("pirson-type").addEventListener("change", function () {
  const companyNameGroup = document.getElementById("company");
  if (this.value === "legal") {
    companyNameGroup.style.display = "block";
    document.getElementById("c-name").setAttribute("required", "required");
  } else {
    companyNameGroup.style.display = "none";
    document.getElementById("c-name").removeAttribute("required");
  }
});

btn.addEventListener("click", async function () {
  const sel = document.getElementById("pirson-type").value;
  const email = document.getElementById("c-email").value;
  const fname = document.getElementById("fname").value;
  const lname = document.getElementById("lname").value;
  const cname = document.getElementById("c-name").value;
  const privacy = document.getElementById("privacy").checked;

  if (fname == "") {
    toastError("Ismingizni kiritmadingiz");
    return;
  } else if (!privacy) {
    toastError("Maxfiylik siyosatiga rozi bolmadingiz");
    return;
  } else if (sel === "legal" && !cname) {
    toastError("Kompaniya nomini kiritmadingiz");
    return;
  } else if (lname == "") {
    toastError("Familiyangizni kiritmadingiz");
    return;
  } else if (email == "") {
    toastError("Emailingizni kiritmadingiz");
    return;
  } else if (sel == "") {
    toastError("Sahxs turini tanlamadingiz");
    return;
  }

  let info = {
    firstName: fname,
    lastName: lname,
    userType: sel,
    companyName: sel === "legal" ? cname : null,
    email: email,
  };

  try {
    const response = await fetch("https://sardor.robohouse.tech/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(info),
    });

    const data = await response.json();

    if (data.success == "no") {
      toastError("Bu email allaqachon ro`yhatdan o`tilgan");
    } else if (data.success) {
      toastSuccess(
        "Siz muvaffaqiyatli ro`yhatdan o`tdingiz, emailingizga parol yuborildi"
      );
      setTimeout(() => (window.location.href = "/login"), 3000);
    } else {
      toastError("Serverda xatolik yuz berdi");
    }
  } catch (error) {
    console.error("Ariza yuborishda xato:", error);
    alert("❌ Xatolik: " + (error.message || "Qayta urinib ko‘ring."));
  }
});
