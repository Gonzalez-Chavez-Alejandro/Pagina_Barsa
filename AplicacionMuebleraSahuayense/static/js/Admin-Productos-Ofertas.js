// Activar o desactivar el input de descuento según el checkbox
document.getElementById('ofertaProducto').addEventListener('change', function() {
    const descuentoInput = document.getElementById('descuentoSeleccionado');
    const precioOferta = document.getElementById('precioOfertaProducto');
    
    if (this.checked) {
      descuentoInput.disabled = false;
      aplicarDescuento();
    } else {
      descuentoInput.disabled = true;
      descuentoInput.value = "";
      precioOferta.value = "";
      mostrarToast("Descuento desactivado", "info");
    }
  });
  
  function aplicarDescuento() {
    const precio = parseFloat(document.getElementById('precioProducto').value);
    const descuento = parseFloat(document.getElementById('descuentoSeleccionado').value);
    const precioOferta = document.getElementById('precioOfertaProducto');
  
    if (!isNaN(precio) && !isNaN(descuento) && descuento >= 0 && descuento <= 100) {
      const nuevoPrecio = precio - (precio * (descuento / 100));
      precioOferta.value = nuevoPrecio.toFixed(2);
    } else {
      precioOferta.value = "";
    }
  }
  function cerrarModalAgregar() {
    document.getElementById('Modal-Agregar-Producto').style.display = 'none';
  }
  function aplicarDescuento() {
    // Obtén el valor del precio original y el descuento
    var precio = parseFloat(document.getElementById("precioProducto").value);
    var descuento = parseFloat(document.getElementById("descuentoSeleccionado").value);
    
    // Verifica si el precio y el descuento son números válidos
    if (!isNaN(precio) && !isNaN(descuento)) {
      // Calcula el precio con descuento
      var precioConDescuento = precio - (precio * (descuento / 100));
      
      // Muestra el precio con descuento en el campo correspondiente
      document.getElementById("precioProductoDescuento").value = precioConDescuento.toFixed(2);
    } else {
      // Si no es válido, vacía el campo de descuento
      document.getElementById("precioProductoDescuento").value = "";
      mostrarToast("Descuento inválido. Debe ser entre 0 y 100", "error");
    }
  }
  








