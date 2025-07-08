function mostrarToast(mensaje, tipo = "info") {
  const toast = document.getElementById("toast");
  const icon = document.getElementById("toastIcon");
  const texto = document.getElementById("toastMessage");

  texto.textContent = mensaje;
  toast.className = ""; 
  toast.classList.add(tipo, "visible");

if (tipo === "success") {
  icon.className = "fas fa-check-circle";
  icon.style.color = "#2ecc71";
} else if (tipo === "error") {
  icon.className = "fas fa-times-circle";
  icon.style.color = "#e74c3c";
} else if (tipo === "warning") {
  icon.className = "fas fa-exclamation-triangle";
  icon.style.color = "#f39c12";
} else {
  icon.className = "fas fa-info-circle";
  icon.style.color = "#3498db";
}


  toast.style.display = "flex";
  toast.style.opacity = 1;

  setTimeout(() => {
    toast.style.opacity = 0;
    toast.classList.remove("visible");
    setTimeout(() => {
      toast.style.display = "none";
    }, 300);
  }, 3000);
}



