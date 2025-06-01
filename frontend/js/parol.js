const btn = document.getElementById("sendBtn");

btn.addEventListener("click", async function () {
  const email = document.getElementById("c-email").value;
  if (email == "") {
    toastError("Siz emailingizni kiritmadingiz");
    return;
  }
  // loading holatiga o'tkazamiz
  btn.classList.add("loading");
  btn.disabled = true;

  try {
    const response = await fetch(
      "https://sardor.robohouse.tech/api/reset-password",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email }),
      }
    );

    const data = await response.json();

    if (data.success) {
      toastSuccess("Yangi parol emailingizga yuborildi");
      btn.classList.remove("loading");
      btn.disabled = false;
      setTimeout(() => (window.location.href = "/login"), 1000);
    } else {
      toastError(data.message || "Bunday email mavjud emas");
      setTimeout(() => location.reload(), 2000);
    }
  } catch (error) {
    console.error("Ariza yuborishda xato:", error);
    alert("❌ Xatolik: " + (error.message || "Qayta urinib ko‘ring."));
  }
});
