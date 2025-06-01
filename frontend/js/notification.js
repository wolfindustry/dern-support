function showToast(type, message, duration = 4000) {
  const container = document.getElementById("toast-container");

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${message}</span>
    <button class="close-btn">&times;</button>
  `;

  container.appendChild(toast);

  // Yopish tugmasi
  toast.querySelector(".close-btn").addEventListener("click", () => {
    closeToast(toast);
  });

  // Avtomatik yopish
  setTimeout(() => {
    closeToast(toast);
  }, duration);
}

function closeToast(toast) {
  toast.style.animation = "slideOut 0.3s ease forwards";
  setTimeout(() => {
    toast.remove();
  }, 300);
}

// Tez chaqirish uchun qisqa funksiya
function toastSuccess(msg) {
  showToast("success", msg);
}
function toastError(msg) {
  showToast("error", msg);
}
function toastInfo(msg) {
  showToast("info", msg);
}
function toastWarning(msg) {
  showToast("warning", msg);
}
