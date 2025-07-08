let usuarios = [];
let usuariosFiltrados = [];
let paginaActual = 1;
const usuariosPorPagina = 10;
let usuarioAEliminarId = null; 

// Obtener info usuario autenticado desde token guardado
async function obtenerUsuarioAutenticado() {
  const token = localStorage.getItem("access_token");
  if (!token) {
    console.warn("No hay token en localStorage"); // Consola: no token
    return null;
  }

  try {
    const response = await fetch("/api/user-info/", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      console.error(`Error en user-info: ${response.status}`); // Consola: error en user-info con status
      return null;
    }

    return await response.json();

  } catch (error) {
    console.error("Error al obtener info del usuario:", error); // Consola: error en fetch
    mostrarToast("No se pudo obtener la información del usuario", "error");
    return null;
  }
}

// Cargar usuarios
async function cargarUsuarios() {
  const token = localStorage.getItem("access_token");
  if (!token) {
    mostrarToast("No autenticado", "error"); // Alerta: no autenticado
    return;
  }
  // mostrarSpinner();
  try {
    const response = await fetch("/api/users/", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    if (!response.ok) {
      mostrarToast("Error al cargar usuarios", "error"); // Alerta: error al cargar usuarios
      return;
    }
    usuarios = await response.json();
    console.log("Usuarios cargados desde la API:", usuarios);
    usuariosFiltrados = [...usuarios];
    mostrarUsuarios(paginaActual);

  } catch (error) {
    console.error("Error al cargar usuarios:", error); // Consola: error fetch usuarios
    mostrarToast("Error al cargar usuarios", "error");
  } finally {
    ocultarSpinner(); // <-- Ocultar spinner siempre
  }
}

function mostrarUsuarios(pagina = 1) {
  const tbody = document.querySelector(".admin-table tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  const inicio = (pagina - 1) * usuariosPorPagina;
  const fin = inicio + usuariosPorPagina;
  const usuariosPagina = usuariosFiltrados.slice(inicio, fin);

  if (usuariosPagina.length === 0) {
    const fila = document.createElement("tr");
    fila.innerHTML = `<td colspan="6" class="text-center">No se encontraron usuarios</td>`; // Mensaje tabla: no usuarios encontrados
    tbody.appendChild(fila);
    return;
  }

  usuariosPagina.forEach(usuario => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${usuario.id}</td>
      <td>${usuario.username}</td>
      <td>${usuario.email}</td>
      <td>${usuario.phoneUser || ''}</td>
      <td title="${usuario.ubicacionUser}">
      <div class="ubicacion-expandible" onclick="this.classList.toggle('expandido')">
        ${usuario.ubicacionUser || 'No especificado'}
      </div>
    </td>
      <td>
        <button class="btn-admin-desing-edit" data-id="${usuario.id}"><i class="fas fa-edit"></i></button>
        <button class="btn-admin-desing-delete" data-id="${usuario.id}"><i class="fas fa-trash-alt"></i></button>
      </td>
    `;
    tbody.appendChild(fila);
  });

  // Asociar eventos a los botones eliminar después de renderizar
  document.querySelectorAll(".btn-admin-desing-delete").forEach(boton => {
    boton.addEventListener("click", (e) => {
      const idUsuario = e.currentTarget.getAttribute("data-id");
      eliminarUsuario(idUsuario);
    });
  });

  actualizarPaginacion();
  actualizarContadores();
}

document.addEventListener("DOMContentLoaded", async () => {
  const usuario = await obtenerUsuarioAutenticado();

  if (!usuario) {
    mostrarToast("No estás autenticado. Por favor inicia sesión.", "error");
    setTimeout(() => {
      window.location.href = "/login";
    }, 1500); // 1.5 segundos de espera para mostrar el toast
    return;
  }


  if (!usuario.is_superuser) {
    mostrarToast("No tienes permisos para acceder a esta sección", "error");
    document.querySelector(".admin-table").style.display = "none";
    document.getElementById("buscador").style.display = "none";
    document.getElementById("paginaAnterior").style.display = "none";
    document.getElementById("paginaSiguiente").style.display = "none";
    return;
  }

  cargarUsuarios();

  document.getElementById("paginaAnterior")?.addEventListener("click", () => {
    if (paginaActual > 1) {
      paginaActual--;
      mostrarUsuarios(paginaActual);
    }
  });

  document.getElementById("paginaSiguiente")?.addEventListener("click", () => {
    const maxPaginas = Math.ceil(usuariosFiltrados.length / usuariosPorPagina);
    if (paginaActual < maxPaginas) {
      paginaActual++;
      mostrarUsuarios(paginaActual);
    }
  });

  document.getElementById("buscador")?.addEventListener("input", (e) => {
    const texto = e.target.value.toLowerCase();
    usuariosFiltrados = usuarios.filter(u =>
      (u.nombre?.toLowerCase().includes(texto) || u.username?.toLowerCase().includes(texto)) ||
      (u.nombres?.toLowerCase().includes(texto) || u.last_name?.toLowerCase().includes(texto)) ||
      (u.correo?.toLowerCase().includes(texto) || u.email?.toLowerCase().includes(texto)) ||
      (u.telefono?.toLowerCase().includes(texto) || u.phoneUser?.toLowerCase().includes(texto))
    );
    paginaActual = 1;
    mostrarUsuarios(paginaActual);
  });

  // Asociar botones del modal
  document.getElementById("btnConfirmarEliminar")?.addEventListener("click", confirmarEliminacion);
  document.getElementById("btnCancelarEliminar")?.addEventListener("click", cancelarEliminacion);
});

function actualizarPaginacion() {
  const totalPaginas = Math.ceil(usuariosFiltrados.length / usuariosPorPagina);
  document.getElementById("paginaAnterior").disabled = paginaActual <= 1;
  document.getElementById("paginaSiguiente").disabled = paginaActual >= totalPaginas;
}

function actualizarContadores() {
  const contadorElement = document.getElementById("contador-usuarios");
  if (!contadorElement) return;

  const totalUsuarios = usuariosFiltrados.length;
  const inicio = (paginaActual - 1) * usuariosPorPagina + 1;
  const fin = Math.min(paginaActual * usuariosPorPagina, totalUsuarios);

  contadorElement.textContent = `Mostrando ${inicio} a ${fin} de ${totalUsuarios} usuarios`; // Texto contador usuarios
}

function buscarUsuarios() {
  const texto = document.getElementById("buscador")?.value.toLowerCase() || "";

  usuariosFiltrados = usuarios.filter(usuario =>
    usuario.id.toString().includes(texto) ||
    usuario.username?.toLowerCase().includes(texto) ||
    usuario.email?.toLowerCase().includes(texto) ||
    usuario.phoneUser?.toLowerCase().includes(texto)
  );

  paginaActual = 1;
  mostrarUsuarios(paginaActual);
}

// Modal de confirmación
function eliminarUsuario(id) {
  usuarioAEliminarId = id;
  const modal = document.getElementById("modalConfirmacion");
  if (modal) modal.style.display = "block"; // Mostrar modal
}

function cancelarEliminacion() {
  const modal = document.getElementById("modalConfirmacion");
  if (modal) modal.style.display = "none"; // Ocultar modal
  usuarioAEliminarId = null;
}

async function confirmarEliminacion() {
  if (!usuarioAEliminarId) return;

  const token = localStorage.getItem("access_token");
  const btnEliminar = document.getElementById("btnConfirmarEliminar");
  btnEliminar.disabled = true;
  mostrarSpinner();

  try {
    const response = await fetch(`/api/users/${usuarioAEliminarId}/`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (response.ok) {
      mostrarToast("Usuario eliminado correctamente", "success");
      await cargarUsuarios();
    } else {
      const data = await response.json();
      mostrarToast(data.error || "Error al eliminar el usuario", "error");
    }

  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    mostrarToast("Ocurrió un error al intentar eliminar el usuario", "error");
  } finally {
    cancelarEliminacion();
    ocultarSpinner();
    btnEliminar.disabled = false;
  }
}


// Cerrar modal al hacer clic fuera de él
window.addEventListener("click", function (e) {
  const modal = document.getElementById("modalConfirmacion");
  if (e.target === modal) {
    cancelarEliminacion(); // Ocultar modal al hacer clic fuera
  }
});

// Cerrar modal con tecla Escape
window.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    cancelarEliminacion(); // Ocultar modal con tecla Escape
  }
});

// Al cargar el usuario para editar:
document.addEventListener("click", async function (event) {
  if (event.target.closest(".btn-admin-desing-edit")) {
    const idUsuario = event.target.closest(".btn-admin-desing-edit").getAttribute("data-id");
    const token = localStorage.getItem("access_token");
    mostrarSpinner();
    try {
      const res = await fetch(`/api/users/${idUsuario}/`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Error al obtener datos del usuario");

      const usuario = await res.json();

      document.getElementById("modalEditar").style.display = "block";

      document.getElementById("nombreEditar").value = usuario.username || "";
      // Aquí asignamos ageUser al campo 'apellidoEditar' (años)
      document.getElementById("apellidoEditar").value = usuario.ageUser || "";
      document.getElementById("correoEditar").value = usuario.email || "";
      document.getElementById("telefonoEditar").value = usuario.phoneUser || "";
      document.getElementById("ubicacionEditar").value = usuario.ubicacionUser || "";
      document.getElementById("contrasenaEditar").value = ""; // Nunca mostramos contraseñas

      document.getElementById("modalEditar").dataset.userId = usuario.id; // Guardamos ID en modal

    } catch (err) {
      console.error("Error cargando usuario para editar:", err);
      mostrarToast("No se pudo cargar la información del usuario", "error");

    } finally {
      ocultarSpinner();
    }
  }
});

// Guardar cambios:
async function guardarCambios(event) {
  event.preventDefault();

  ["Nombre", "Apellido", "Correo", "Telefono", "Contrasena"].forEach(field => {
    document.getElementById("error" + field).textContent = "";
  });

  const token = localStorage.getItem("access_token");
  const id = document.getElementById("modalEditar").dataset.userId;

  const nombre = document.getElementById("nombreEditar").value.trim();
  const apellidoStr = document.getElementById("apellidoEditar").value.trim();
  const correo = document.getElementById("correoEditar").value.trim();
  const telefono = document.getElementById("telefonoEditar").value.trim();
  const contrasena = document.getElementById("contrasenaEditar").value.trim();

  let hasError = false;

  if (!nombre) {
    document.getElementById("errorNombre").textContent = "El nombre es obligatorio.";
    hasError = true;
  }

  const edad = parseInt(apellidoStr, 10);
  if (!apellidoStr || isNaN(edad) || edad < 1) {
    document.getElementById("errorApellido").textContent = "Por favor ingresa una edad válida.";
    hasError = true;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!correo || !emailRegex.test(correo)) {
    document.getElementById("errorCorreo").textContent = "Correo electrónico inválido.";
    hasError = true;
  }

  const telefonoRegex = /^[\d\s+()-]{7,}$/;
  if (!telefono || !telefonoRegex.test(telefono)) {
    document.getElementById("errorTelefono").textContent = "Teléfono inválido.";
    hasError = true;
  }

  if (contrasena && contrasena.length < 6) {
    document.getElementById("errorContrasena").textContent = "La contraseña debe tener al menos 6 caracteres.";
    hasError = true;
  }

  const ubicacion = document.getElementById("ubicacionEditar").value.trim();

  document.getElementById("error-ubicacion").textContent = "";

  if (hasError) return;

  const data = {
    username: nombre,
    email: correo,
    phoneUser: telefono,
    ageUser: edad,
    ubicacionUser: ubicacion,
  };
  if (contrasena) {
    data.password = contrasena;
  }
  // ✅ Mostrar en consola lo que se enviará al backend
  console.log("## Datos a enviar        :", data);
  const campoAMensaje = {
    username: "Nombre de usuario",
    email: "Correo electrónico",
    phoneUser: "Teléfono",
    ageUser: "Edad",
    password: "Contraseña",
  };

  try {
    const res = await fetch(`/api/users/${id}/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      mostrarToast("Usuario actualizado correctamente", "success");
      document.getElementById("modalEditar").style.display = "none";
      await cargarUsuarios();
    } else {
      const err = await res.json();

      if (typeof err === "object" && err !== null) {
        const primerCampo = Object.keys(err)[0];
        const mensajes = err[primerCampo];
        const mensajeAmigable = Array.isArray(mensajes) ? mensajes[0] : mensajes;
        const campoLegible = campoAMensaje[primerCampo] || primerCampo;
        mostrarToast(`Error en ${campoLegible}: ${mensajeAmigable}`, "error");
      } else if (err.detail) {
        mostrarToast("Error: " + err.detail, "error");
      } else {
        mostrarToast("Error al actualizar usuario.", "error");
      }
    }
  } catch (error) {
    console.error("Error al enviar actualización:", error);
    mostrarToast("Fallo al actualizar usuario", "error");
  }
}

function cerrarModal() {
  document.getElementById("modalEditar").style.display = "none";
}