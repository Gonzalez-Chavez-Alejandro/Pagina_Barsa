let categoriaNombreSeleccionada = null;
let paginaActualCategoria = 1;
let itemsPorPaginaCategoria = 100;

// Función para obtener imagen placeholder segura
function getPlaceholderImage(text = 'Imagen no disponible', width = 80, height = 80) {
  return `https://dummyimage.com/${width}x${height}/cccccc/969696&text=${encodeURIComponent(text)}`;
}

// Función para validar y normalizar URLs de imágenes
function normalizeImageUrl(url) {
  if (!url) return '';

  // Si ya es una URL completa de Cloudinary válida, no la modifiques
  if (url.startsWith('https://res.cloudinary.com/')) {
    return url;
  }

  // Si viene algo raro (como image/upload/https://...), intenta limpiar
  if (url.includes('https://res.cloudinary.com/')) {
    const index = url.indexOf('https://res.cloudinary.com/');
    return url.slice(index);
  }

  // Si es una ruta relativa, prepende base URL
  //return `https://res.cloudinary.com/dacrpsl5p/image/upload/${url}`;
}

// Función para cargar categorías desde la API
async function cargarCategorias() {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    mostrarToast("No estás autenticado", "warning");
    return;
  }
  
  try {
    const response = await fetch('/categorias/consulta/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('No se pudieron obtener las categorías');
    }

    const data = await response.json();

    window.categorias = data.map(cat => {
      const imagenFinal = normalizeImageUrl(cat.imagenCategory || '');
      console.log(`[DEBUG] Categoría: ${cat.nameCategory}, Imagen original: ${cat.imagenCategory}, Imagen final: ${imagenFinal}`);

      return {
        id: cat.id || cat._id || cat.nameCategory,
        nombre: cat.nameCategory,
        descripcion: cat.descriptionCategory,
        imagen: imagenFinal
      };
    });


    mostrarCategorias();
  } catch (error) {
    console.error('Error al cargar categorías:', error);
    mostrarToast('Error al cargar categorías: ' + error.message, 'error');
  }
}

// Mostrar categorías en la tabla
function mostrarCategorias() {
  const tbody = document.getElementById("tablaCategorias");
  tbody.innerHTML = "";

  const buscador = document.getElementById("buscadorCategorias").value.toLowerCase();

  // Filtrar categorías por búsqueda
  let categoriasFiltradas = window.categorias.filter(cat =>
    cat.nombre.toLowerCase().includes(buscador) ||
    cat.descripcion.toLowerCase().includes(buscador)
  );

  // Ordenar categorías por ID ascendente
  categoriasFiltradas.sort((a, b) => a.id - b.id);

  const totalCategorias = categoriasFiltradas.length;
  const totalPaginas = Math.ceil(totalCategorias / itemsPorPaginaCategoria);

  if (paginaActualCategoria > totalPaginas) {
    paginaActualCategoria = totalPaginas > 0 ? totalPaginas : 1;
  }

  const inicio = (paginaActualCategoria - 1) * itemsPorPaginaCategoria;
  const fin = inicio + itemsPorPaginaCategoria;

  const categoriasPagina = categoriasFiltradas.slice(inicio, fin);

  categoriasPagina.forEach(categoria => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${categoria.id || 'N/A'}</td>
      <td>${categoria.nombre}</td>
      <td>${categoria.descripcion}</td>
      <td>
        <img src="${categoria.imagen || getPlaceholderImage()}" 
             alt="${categoria.nombre}" 
             width="80" 
             style="border:1px solid #ccc;"
             onerror="this.src='${getPlaceholderImage()}'">
      </td>
      <td class="acciones-categoria">
        <button class="btn-admin-desing-edits btn-editar-categoria" 
                onclick="editarCategoria('${categoria.nombre}')">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn-admin-desing-deletes-eliminar" onclick="abrirModalEliminarCategoria('${categoria.id}')">
          <i class="fas fa-trash-alt"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById("resultadosInfo").textContent =
    `Mostrando ${categoriasPagina.length} de ${totalCategorias} categorías`;

  document.getElementById("paginaActualCategoria").textContent = `Página ${paginaActualCategoria}`;
  document.getElementById("totalPaginasCategoria").textContent = totalPaginas || 1;
}

// ========== [CORREGIDO] Eventos de paginación ==========
function anteriorPagina() {
  if (paginaActualCategoria > 1) {
    paginaActualCategoria--;
    mostrarCategorias();
  }
}

function siguientePagina() {
  const buscador = document.getElementById("buscadorCategorias").value.toLowerCase();
  const categoriasFiltradas = window.categorias.filter(cat =>
    cat.nombre.toLowerCase().includes(buscador) ||
    cat.descripcion.toLowerCase().includes(buscador)
  );

  const totalPaginas = Math.ceil(categoriasFiltradas.length / itemsPorPaginaCategoria);

  if (paginaActualCategoria < totalPaginas) {
    paginaActualCategoria++;
    mostrarCategorias();
  }
}

// Asegúrate que esta parte esté en tu DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btnAnterior").addEventListener("click", anteriorPagina);
  document.getElementById("btnSiguiente").addEventListener("click", siguientePagina);
});

// Filtrar categorías
function filtrarCategorias() {
  paginaActualCategoria = 1;
  mostrarCategorias();
}

// Cambiar número de ítems por página
function cambiarItemsPorPagina() {
  const select = document.getElementById("itemsPorPagina");
  itemsPorPaginaCategoria = parseInt(select.value, 10);
  paginaActualCategoria = 1;
  mostrarCategorias();
}

// Cambiar página
function cambiarPaginaCategoria(direccion) {
  paginaActualCategoria += direccion;
  mostrarCategorias();
}

// Abrir modal para agregar categoría
function abrirModalAgregarCategoria() {
  document.getElementById('modalAgregarCategoria').style.display = 'block';
}

// Cerrar modal para agregar categoría
function cerrarModalAgregarCategoria() {
  document.getElementById('modalAgregarCategoria').style.display = 'none';
  document.getElementById('nombreCategoria').value = '';
  document.getElementById('descripcionCategoria').value = '';
  document.getElementById('subirImagen').value = '';
  const previewImg = document.getElementById('vistaPreviaAgregarImagen');
  previewImg.src = '';
  previewImg.style.display = 'none';
}

// Abrir modal para editar categoría
function editarCategoria(nombreCategoria) {
  const categoria = window.categorias.find(cat => cat.nombre === nombreCategoria);
  if (!categoria) {
    mostrarToast("Categoría no encontrada","warning");
    return;
  }

  categoriaNombreSeleccionada = nombreCategoria;

  document.getElementById('editarNombreCategoria').value = categoria.nombre;
  document.getElementById('editarDescripcionCategoria').value = categoria.descripcion;
  document.getElementById('vistaPreviaEditarImagen').src = categoria.imagen || getPlaceholderImage();

  document.getElementById('modalEditarCategoria').style.display = 'block';
}

// Cerrar modal para editar categoría
function cerrarModalEditarCategoria() {
  document.getElementById('modalEditarCategoria').style.display = 'none';
  document.getElementById('editarNombreCategoria').value = '';
  document.getElementById('editarDescripcionCategoria').value = '';
  document.getElementById('editarImagenArchivo').value = '';
  document.getElementById('vistaPreviaEditarImagen').src = '';
  categoriaNombreSeleccionada = null;
}

// Guardar nueva categoría
async function guardarCategoria() {
 
  const token = localStorage.getItem('accessToken');
  if (!token) {
    mostrarToast("No estás autenticado. Por favor inicia sesión.","error");
    return;
  }

  const nombre = document.getElementById('nombreCategoria').value.trim();
  const descripcion = document.getElementById('descripcionCategoria').value.trim();
  const imagenFile = document.getElementById('subirImagen').files[0];

  if (!nombre || !imagenFile) {
    mostrarToast("Nombre e imagen son obligatorios.", "error");
    return;
  }

  // Verificar si ya existe una categoría con ese nombre
const yaExiste = window.categorias.some(cat =>
  cat.nombre.toLowerCase() === nombre.toLowerCase()
);

if (yaExiste) {
  mostrarToast("Ya existe una categoría con ese nombre.", "error");
  return;
}


  const formData = new FormData();
  formData.append('nameCategory', nombre);
  formData.append('descriptionCategory', descripcion);
  formData.append('imagenCategory', imagenFile);
mostrarSpinner();
  try {
    const response = await fetch('/categorias/registro/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (response.ok) {
      mostrarToast('Categoría guardada con éxito', 'success');
      cerrarModalAgregarCategoria();
      await cargarCategorias();
    } else {
      const errorData = await response.json();
      mostrarToast('Error al guardar: ' + (errorData.message || JSON.stringify(errorData)),'error');
    }
  } catch (error) {
    console.error('Error al guardar categoría:', error);
    mostrarToast('Error de conexión: ' + error.message,'error');
  }finally {
  ocultarSpinner();
}
}

// Guardar edición de categoría
async function guardarEdicionCategorias() {
  const token = localStorage.getItem('accessToken');
  if (!token || !categoriaNombreSeleccionada) {
    mostrarToast('No estás autenticado o no hay categoría seleccionada','warning');
    return;
  }

  const nuevoNombre = document.getElementById('editarNombreCategoria').value.trim();
  const descripcion = document.getElementById('editarDescripcionCategoria').value.trim();
  const imagenFile = document.getElementById('editarImagenArchivo').files[0];

  if (!nuevoNombre) {
     mostrarToast('El nombre de la categoría es obligatorio', 'warning');
    return;
  }
// Verifica si ya existe una categoría con ese nombre
const yaExiste = window.categorias.some(cat =>
  cat.nombre.toLowerCase() === nuevoNombre.toLowerCase() &&
  cat.nombre !== categoriaNombreSeleccionada // exceptuamos la actual
);

if (yaExiste) {
  mostrarToast("Ya existe una categoría con ese nombre.", "error");
  return;
}

  const formData = new FormData();
  formData.append('nameCategory', nuevoNombre);
  formData.append('descriptionCategory', descripcion);
  if (imagenFile) {
    formData.append('imagenCategory', imagenFile);
  }
mostrarSpinner();
  try {
    const response = await fetch(`/categorias/actualizar/${categoriaNombreSeleccionada}/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData
    });

    if (response.ok) {
      mostrarToast('Categoría actualizada con éxito','success');
      cerrarModalEditarCategoria();
      await cargarCategorias();
    } else {
      const errorData = await response.json();
      const mensaje = errorData.message || Object.values(errorData).flat().join(' ') || 'Error desconocido';

      mostrarToast(mensaje, 'error');
    }
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    mostrarToast('Error de conexión: ' + error.message,'error');
  }finally {
  ocultarSpinner();
}
}

// Eliminar categoría
async function eliminarCategoria(nombreCategoria) {
  if (!confirm(`¿Estás seguro de que deseas eliminar la categoría "${nombreCategoria}"?`)) {
    return;
  }

  const token = localStorage.getItem('accessToken');
  if (!token) {
    mostrarToast('No estás autenticado. Por favor inicia sesión.','error');
    return;
  }
  mostrarSpinner(); 
  try {
    const response = await fetch(`/categorias/actualizar/${nombreCategoria}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      mostrarToast('Categoría eliminada con éxito','success');
      await cargarCategorias();
    } else {
      const errorData = await response.json();
      mostrarToast('Error al eliminar: ' + (errorData.message || JSON.stringify(errorData)),'error');
    }
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    mostrarToast('Error de conexión: ' + error.message,'error');
  }finally {
  ocultarSpinner();
}
}

// Mostrar vista previa de imagen al seleccionar


document.getElementById('editarImagenArchivo').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (event) {
      document.getElementById('vistaPreviaEditarImagen').src = event.target.result;
    };
    reader.readAsDataURL(file);
  }
});

// Inicialización cuando el DOM está listo
document.addEventListener("DOMContentLoaded", () => {
  cargarCategorias();

  // Asignar eventos
  document.getElementById('buscadorCategorias').addEventListener('input', filtrarCategorias);

  document.getElementById('btnGuardarCategoria').addEventListener('click', guardarCategoria);
  document.getElementById('itemsPorPagina').addEventListener('change', cambiarItemsPorPagina);

  const btnGuardarEdicion = document.querySelector('.btn-agregar-editar-categoria');
  if (btnGuardarEdicion) {
    btnGuardarEdicion.addEventListener('click', guardarEdicionCategorias);
  }
});


let categoriaIdEliminar = null;

function abrirModalEliminarCategoria(id) {
  categoriaIdEliminar = id;
  document.getElementById('modalEliminarCategoria').style.display = 'block';
}

function cerrarModalEliminarCategoria() {
  categoriaIdEliminar = null;
  document.getElementById('modalEliminarCategoria').style.display = 'none';
}


async function confirmarEliminarCategoria() {
  
  if (!categoriaIdEliminar) return;
mostrarSpinner(); 
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      errorMensaje("No estás autenticado");
      return;
    }

    const response = await fetch(`/categorias/eliminar/${categoriaIdEliminar}/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})  // 👈 importante aunque no mandes nada
    });


    const data = await response.json();

    if (response.ok && data.success) {
      mostrarMensaje('Categoría eliminada correctamente');
      cerrarModalEliminarCategoria();
      cargarCategorias(false);  // función que debes tener para refrescar la lista
    } else if (data.warning) {
      errorMensaje(data.warning);
    } else {
      errorMensaje(data.error || 'Error al eliminar la categoría');
    }

  } catch (error) {
    console.error('Error:', error);
    errorMensaje('Error inesperado al eliminar');
  }finally {
    ocultarSpinner();  // 👈 Siempre ocultar al final
    
  }
}










let timeoutMensaje;
let ultimoMensaje = null;  // almacena el último mensaje mostrado

function mostrarMensaje(mensaje, tipo = "success") {
  const mensajeDiv = document.getElementById("mensaje-flotante");
  const textoSpan = document.getElementById("texto-mensaje");
  const icono = document.getElementById("icono-mensaje");

  if (!mensajeDiv || !textoSpan || !icono) return;

  // Si el mensaje es igual al último mostrado y aún está visible, no hacemos nada
  if (mensaje === ultimoMensaje && mensajeDiv.classList.contains("mensaje-visible")) {
    return;
  }

  // Actualizamos el último mensaje
  ultimoMensaje = mensaje;

  textoSpan.textContent = mensaje;

  if (tipo === "error") {
    mensajeDiv.style.backgroundColor = "#e74c3c"; // rojo
    icono.className = "fas fa-times-circle icono-mensaje";
    icono.style.color = "#ffd4d4";
  } else {
    mensajeDiv.style.backgroundColor = "#4a6fa5"; // gris azulado
    icono.className = "fas fa-check-circle icono-mensaje";
    icono.style.color = "#d0e6ff";
  }

  mensajeDiv.classList.remove("mensaje-oculto");
  mensajeDiv.classList.add("mensaje-visible");

  clearTimeout(timeoutMensaje); // limpiar timeout anterior
  timeoutMensaje = setTimeout(() => {
    mensajeDiv.classList.remove("mensaje-visible");
    mensajeDiv.classList.add("mensaje-oculto");
    ultimoMensaje = null; // una vez oculto, permite mostrar ese mensaje otra vez en el futuro
  }, 3000);
}
function errorMensaje(msg) {
  // Puedes personalizar esto con un modal, toast, etc.
  alert(msg);
}
