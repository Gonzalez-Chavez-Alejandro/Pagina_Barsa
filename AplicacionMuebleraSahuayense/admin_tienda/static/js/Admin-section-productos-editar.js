document.addEventListener("DOMContentLoaded", () => {
  // 1. Verifica token (si aplica)
  const token = localStorage.getItem('accessToken');
  console.log("token", token);

  // 2. Verifica hash en la URL (como #section-productos)
  const hash = window.location.hash;
  if (hash === "#section-productos" || hash === "#abrir-productos") {
    mostrarSeccion("section-productos");
  }

  // 3. Verifica parámetros GET en la URL (como ?abrir=section-productos)
  const params = new URLSearchParams(window.location.search);
  const abrir = params.get('abrir');
  if (abrir === 'section-productos') {
    mostrarSeccion('section-productos');
  }

  // 4. Aquí puedes seguir agregando otras inicializaciones
});
