const btn = document
  .getElementById("bnt")
  .addEventListener("click", async function (e) {
    e.preventDefault();

    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const message = document.getElementById("changePasswordMessage");

    if(currentPassword == ''){
        toastError('Siz joriy parolni kiritmadingiz')
        return
    } else if(newPassword == ''){
        toastError('Siz yangi parolni kiritmadingiz')
        return
    } else if(confirmPassword == ''){
        toastError('Siz tasdiqlash parolni kiritmadingiz')
        return
    }

    let size = newPassword.length


    if (size < 8){
        toastError('Yangi parol 8 belgidan kam bolmasligi kerak')
        return
    }

    const userData = localStorage.getItem("userEmail");
    if (!userData) {
      toastError("❌ Foydalanuvchi tizimga kirmagan.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toastError("❌ Yangi parollar mos emas!")
      return;
    }

    try {
      const res = await fetch(
        "http://localhost:3000/change-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: userData,
            currentPassword,
            newPassword,
          }),
        }
      );

      const data = await res.json();
      console.log(data.lname);

      if (res.ok) {
        toastSuccess("✅ Parol muvaffaqiyatli yangilandi!")
        document.getElementById("changePasswordForm").reset();
      } else {
        toastError(`❌ ${data.message}`)
      }
    } catch (err) {
      console.log("❌ Server bilan ulanishda xatolik.")
    }
  });
