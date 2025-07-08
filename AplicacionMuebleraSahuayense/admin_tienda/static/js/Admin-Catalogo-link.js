const API_URL = '/catalogos/catalogo-api/';

async function actualizarPDF() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        mostrarToast("No estás autenticado.", "error");
        return;
    }

    const nuevoEnlace = document.getElementById('nuevoEnlace').value.trim();

    if (!esURLValida(nuevoEnlace)) {
        mostrarToast("Por favor ingresa una URL válida.", "error");
        return;
    }
    mostrarSpinner();
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ url_pdf: nuevoEnlace })
        });

        let data;
        const text = await response.text();

        try {
            data = JSON.parse(text);
        } catch {
            throw new Error("Respuesta inesperada del servidor: " + text);
        }

        if (!response.ok) {
            throw new Error(data.error || 'Error al guardar el catálogo en el servidor');
        }

        mostrarToast('Catálogo actualizado correctamente.\nSe abrirá el PDF en una pestaña nueva.', "success");
        window.open(data.url_pdf, '_blank');  // Aquí abrimos en pestaña nueva

    } catch (error) {
        mostrarToast('Error al actualizar el catálogo: ' + error.message, "error");
        console.error(error);
    }finally {
    ocultarSpinner();
  }
}


function limpiarCampo() {
    const inputEnlace = document.getElementById('nuevoEnlace');
    inputEnlace.value = '';  // Limpias el campo
    inputEnlace.focus(); 
}

function esURLValida(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}


(() => {
  const STORAGE_KEY = 'pdfConfig';
  const API_URL = '/catalogos/catalogo-api/';
  const DEFAULT_LINK = 'https://example.com/catalogo.pdf'; // Pon tu URL por defecto

  const abrirCatalogo = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const cargarDesdeAPI = async () => {
    mostrarSpinner();  // <-- Mostrar spinner al inicio
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Error al obtener catálogo');

      const data = await response.json();
      const urlPdf = data.url_pdf?.trim() || DEFAULT_LINK;

      localStorage.setItem(STORAGE_KEY, urlPdf);

      const btn = document.getElementById('abrirCatalogoBtn');
      if (btn) btn.onclick = () => abrirCatalogo(urlPdf);

      console.log('Catálogo cargado correctamente'); // Toast éxito

    } catch (error) {
      console.error('No se pudo cargar el catálogo desde API:', error);

      const enlaceLocal = localStorage.getItem(STORAGE_KEY) || DEFAULT_LINK;
      const btn = document.getElementById('abrirCatalogoBtn');
      if (btn) btn.onclick = () => abrirCatalogo(enlaceLocal);

      mostrarToast('Error al cargar catálogo: ' + error.message, 'error'); // Toast error
    } finally {
      ocultarSpinner(); // <-- Ocultar spinner siempre al final
    }
  };

  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      const btn = document.getElementById('abrirCatalogoBtn');
      if (btn) btn.onclick = () => abrirCatalogo(e.newValue);
    }
  });

  document.addEventListener('DOMContentLoaded', cargarDesdeAPI);
})();
