document.getElementById("form-superuser").addEventListener("submit", async (e) => {
  e.preventDefault();

  // Limpiar mensajes anteriores
  const fields = ["username", "email", "password", "ageUser", "phoneUser"];
  fields.forEach(field => {
    document.getElementById(`error-${field}`).textContent = "";
  });
  document.getElementById("successMsg").textContent = "";

  const token = localStorage.getItem("accessToken");
  if (!token) {
    mostrarToast("Debes iniciar sesión como Administrador.", "error");
    return;
  }

  // Obtener datos
  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const ageUser = document.getElementById("ageUser").value.trim();
  const phoneInput = document.getElementById("phoneUser");
  const phoneUser = phoneInput.value.trim().replace(/\s+/g, '');
  phoneInput.value = phoneUser;

  let valid = true;

  const mostrarError = (id, mensaje) => {
    const campo = document.getElementById(`error-${id}`);
    campo.textContent = mensaje;
    campo.style.display = 'block';
    valid = false;
  };

  // Validaciones frontend
  if (username === "") mostrarError("username", "El nombre de usuario es obligatorio.");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) mostrarError("email", "Correo electrónico no válido.");

  if (password.length < 8) mostrarError("password", "La contraseña debe tener al menos 8 caracteres.");

  const edad = parseInt(ageUser);
  if (isNaN(edad) || edad < 1 || edad > 100) {
    mostrarError("ageUser", "Edad debe ser un número positivo.");
  }

  const telefonoRegex = /^\+?\d{10,20}$/;
  if (!telefonoRegex.test(phoneUser)) {
    mostrarError("phoneUser", "Número de teléfono inválido. Usa dígitos, opcional '+' y máximo 20 caracteres sin espacios.");
  }

  if (!valid) return;

  const data = { username, email, password, ageUser, phoneUser };

  try {
     mostrarSpinner();
    const res = await fetch("/api/crear-superuser/", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    // Traducciones personalizadas
    if (result.username?.includes("A user with that username already exists.")) {
      mostrarError("username", "Ya existe un usuario con ese nombre de usuario.");
    }
    if (result.email?.includes("A user with that email already exists.")) {
      mostrarError("email", "Ya existe un usuario con ese correo electrónico.");
    }

    if (!res.ok) {
      if (typeof result === "object") {
        for (const field in result) {
          const span = document.getElementById(`error-${field}`);
          if (span && !span.textContent) {
            span.textContent = result[field].join(" ");
            span.style.display = 'block';
          } else if (!span) {
            mostrarToast(result[field], "error");
          }
        }
      } else {
        mostrarToast("Error inesperado al crear el superusuario.", "error");
      }
      return;
    }

    // Todo OK
    document.getElementById("successMsg").textContent = result.message || "¡Superusuario creado correctamente!";
    document.getElementById("form-superuser").reset();

  } catch (error) {
    console.error("Error al enviar solicitud:", error);
    mostrarToast("Error de conexión. Intenta nuevamente.", "error");
  }finally {
    ocultarSpinner();
  }
});
