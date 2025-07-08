// Mostrar/ocultar submenús
function toggleSubmenu(button) {
  const li = button.parentElement;
  li.classList.toggle("activo");
}

// Mostrar/ocultar menú lateral en móviles
const botonMenu = document.getElementById("botonMenu");
const menuLateral = document.getElementById("menuLateral");

botonMenu.addEventListener("click", () => {
  menuLateral.classList.toggle("mostrar-menu");
});

const botonCerrar = document.getElementById("cerrarMenu");
botonCerrar.addEventListener("click", () => {
  menuLateral.classList.remove("mostrar-menu");
});

// Mostrar secciones y cerrar menú móvil
function mostrarSeccion(idSeccion) {
  ocultarTodasLasSecciones();
  const seccionActiva = document.getElementById(idSeccion);
  if (seccionActiva) {
    seccionActiva.classList.add('activa');
  }
  menuLateral.classList.remove("mostrar-menu");
}

// Mostrar la sección de inicio
function mostrarInicio() {
  ocultarTodasLasSecciones();
  const inicio = document.getElementById('inicio');
  inicio.classList.add('activa');
}

// Ocultar todas las secciones
function ocultarTodasLasSecciones() {
  document.querySelectorAll('.seccion').forEach(seccion => {
    seccion.classList.remove('activa');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const btnCerrarSesion = document.getElementById('btnCerrarSesion');
  if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener('click', () => {
      mostrarSpinner();
      try {
        localStorage.removeItem('access_token');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refresh_token');
        sessionStorage.clear();

        mostrarToast("Sesión cerrada correctamente", "success");
      } catch (error) {
        mostrarToast("Ocurrió un error al cerrar sesión", "error"); // Manejo de error
        console.error(error);
      } finally {
        setTimeout(() => {
          ocultarSpinner();
          window.location.href = '/login/';
        }, 1500);
      }
    });
  }
});