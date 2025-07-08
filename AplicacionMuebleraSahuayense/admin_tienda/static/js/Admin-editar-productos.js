 function eliminarImagen(url) {
      const button = event.target;
      const contenedor = button.closest('div');
      contenedor.remove();

      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'eliminar_imagenes[]';
      input.value = url;

      document.getElementById('imagenes_a_eliminar_container').appendChild(input);
    }
     function validarDescuento(input) {
    let valor = parseInt(input.value, 10);

    if (isNaN(valor)) {
      input.value = '';
    } else if (valor < 0) {
      input.value = 0;
    } else if (valor > 100) {
      input.value = 100;
    }
  }