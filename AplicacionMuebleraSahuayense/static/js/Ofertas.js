let productosActuales = [];

function mostrarProductosCategoria(idCategoria, nombreCategoria) {
  ocultarTodasLasSecciones();

  productosActuales = productos.filter(p => p.categoriaId === idCategoria);
  llenarTablaProductos(productosActuales);

  document.getElementById('productos').classList.add('activa');
  document.getElementById('categoria-titulo').textContent = `Productos de ${nombreCategoria}`;
  document.getElementById('categoria-id').value = idCategoria;
  document.getElementById('formulario-producto').classList.add('activa');

  document.getElementById('filtroOferta').value = "todos";
}
 
function filtrarPorOferta() {
  const valor = document.getElementById('filtroOferta').value;
  let productosFiltrados = [];

  if (valor === 'oferta') {
    productosFiltrados = productosActuales.filter(p => p.oferta);
  } else if (valor === 'sinOferta') {
    productosFiltrados = productosActuales.filter(p => !p.oferta);
  } else {
    productosFiltrados = productosActuales;
  }

  llenarTablaProductos(productosFiltrados);
}




