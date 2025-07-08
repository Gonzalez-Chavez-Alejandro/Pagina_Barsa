/*
let idCounterproductos = 1;
window.productos = [
  { id: idCounterproductos++, nombre: "aSilla moderna ssssss sss ssss sssssssssss ssssssss ssssssss ssssssssssssss  xxxxxxxxxxxxx", descripcion: "Silla de madera con respaldo sdfs dsfsdf dsf dsf sfd sdfs df fsdfsd fdsfdf dsfdfs Silla de madera con respaldo sdfs dsfsdf dsf dsf sfd sdfs df fsdfsd fdsfdf dsfdfs Silla de madera con respaldo sdfs dsfsdf dsf dsf sfd sdfs df fsdfsd fdsfdf dsfdfs", precio: 1200, oferta: true, precioOferta: 996,  nombreimagenes: "https://res.cloudinary.com/dacrpsl5p/image/upload/v1745430695/Logo-Negro-B_-_copia_v1estv.png,https://res.cloudinary.com/dacrpsl5p/image/upload/v1746330867/CARPETA1/Disney%20Universe%2012_22_2024%204_18_43%20PM.png,https://res.cloudinary.com/dacrpsl5p/image/upload/v1746488796/muebles/e1ol0ruizbzqfugaamx4.webp,https://res.cloudinary.com/dacrpsl5p/image/upload/v1746330867/CARPETA1/Disney%20Universe%2012_22_2024%204_18_43%20PM.png,https://res.cloudinary.com/dacrpsl5p/image/upload/v1746330867/CARPETA1/Disney%20Universe%2012_22_2024%204_18_43%20PM.png,https://res.cloudinary.com/dacrpsl5p/image/upload/v1746330867/CARPETA1/Disney%20Universe%2012_22_2024%204_18_43%20PM.png", categoriaId: 1 },
  { id: idCounterproductos++, nombre: "xSilla moderna", descripcion: "Silla de madera con respaldo", precio: "-", oferta: true, precioOferta: 0, nombreimagenes: "https://res.cloudinary.com/dacrpsl5p/image/upload/v1746330867/CARPETA1/Disney%20Universe%2012_22_2024%204_18_43%20PM.png,https://res.cloudinary.com/dacrpsl5p/image/upload/v1745430695/Logo-Negro-B_-_copia_v1estv.png", categoriaId: 1 },
  { id: idCounterproductos++, nombre: "bSilla moderna", descripcion: "Silla de madera con respaldo", precio: 1200, oferta: true, precioOferta: 996, nombreimagenes: "https://res.cloudinary.com/dacrpsl5p/image/upload/v1746330867/CARPETA1/Disney%20Universe%2012_22_2024%204_18_43%20PM.png", categoriaId: 2 },
  { id: idCounterproductos++, nombre: "cMesa redonda", descripcion: "Mesa para comedor", precio: 3500, oferta: false, precioOferta: 0, nombreimagenes: "https://res.cloudinary.com/dacrpsl5p/image/upload/v1746330867/CARPETA1/Disney%20Universe%2012_22_2024%204_18_43%20PM.png", categoriaId: 3 },
  { id: idCounterproductos++, nombre: "dSilla moderna", descripcion: "Silla de madera con respaldo", precio: 1200, oferta: true, precioOferta: 999, nombreimagenes: "https://res.cloudinary.com/dacrpsl5p/image/upload/v1746330867/CARPETA1/Disney%20Universe%2012_22_2024%204_18_43%20PM.png", categoriaId: 4 },
  { id: idCounterproductos++, nombre: "fMesa redonda", descripcion: "Mesa para comedor", precio: 3500, oferta: false, precioOferta: 0, nombreimagenes: "https://res.cloudinary.com/dacrpsl5p/image/upload/v1746330867/CARPETA1/Disney%20Universe%2012_22_2024%204_18_43%20PM.png", categoriaId: 5 },
  { id: idCounterproductos++, nombre: "gSilla moderna", descripcion: "Silla de madera con respaldo", precio: 1200, oferta: true, precioOferta: 999, nombreimagenes: "https://res.cloudinary.com/dacrpsl5p/image/upload/v1746330867/CARPETA1/Disney%20Universe%2012_22_2024%204_18_43%20PM.png", categoriaId: 6 },
  { id: idCounterproductos++, nombre: "hMesa redonda", descripcion: "Mesa para comedor", precio: 3500, oferta: false, precioOferta: 0, nombreimagenes: "https://res.cloudinary.com/dacrpsl5p/image/upload/v1746330867/CARPETA1/Disney%20Universe%2012_22_2024%204_18_43%20PM.png", categoriaId: 7 },
  { id: idCounterproductos++, nombre: "jSilla moderna", descripcion: "Silla de madera con respaldo", precio: 1200, oferta: true, precioOferta: 999, nombreimagenes: "https://res.cloudinary.com/dacrpsl5p/image/upload/v1746330867/CARPETA1/Disney%20Universe%2012_22_2024%204_18_43%20PM.png", categoriaId: 8 },
  { id: idCounterproductos++, nombre: "aSilla moderna", descripcion: "Silla de madera con respaldo", precio: 1200, oferta: true, precioOferta: 999, nombreimagenes: "https://res.cloudinary.com/dacrpsl5p/image/upload/v1746330867/CARPETA1/Disney%20Universe%2012_22_2024%204_18_43%20PM.png", categoriaId: 9 },
  { id: idCounterproductos++, nombre: "xSilla moderna", descripcion: "Silla de madera con respaldo", precio: 1200, oferta: true, precioOferta: 999, nombreimagenes: "https://res.cloudinary.com/dacrpsl5p/image/upload/v1746330867/CARPETA1/Disney%20Universe%2012_22_2024%204_18_43%20PM.png", categoriaId: 1 },
  { id: idCounterproductos++, nombre: "bSilla moderna", descripcion: "Silla de madera con respaldo", precio: 1200, oferta: true, precioOferta: 999, nombreimagenes: "https://res.cloudinary.com/dacrpsl5p/image/upload/v1746330867/CARPETA1/Disney%20Universe%2012_22_2024%204_18_43%20PM.png", categoriaId: 1 },
  { id: idCounterproductos++, nombre: "cMesa redonda", descripcion: "Mesa para comedor", precio: 3500, oferta: false, precioOferta: 0, nombreimagenes: "https://res.cloudinary.com/dacrpsl5p/image/upload/v1746330867/CARPETA1/Disney%20Universe%2012_22_2024%204_18_43%20PM.png", categoriaId: 1 },
  { id: idCounterproductos++, nombre: "dSilla moderna", descripcion: "Silla de madera con respaldo", precio: 1200, oferta: true, precioOferta: 999, nombreimagenes: "https://res.cloudinary.com/dacrpsl5p/image/upload/v1746330867/CARPETA1/Disney%20Universe%2012_22_2024%204_18_43%20PM.png", categoriaId: 1 },
  { id: idCounterproductos++, nombre: "fMesa redonda", descripcion: "Mesa para comedor", precio: 3500, oferta: false, precioOferta: 0, nombreimagenes: "https://res.cloudinary.com/dacrpsl5p/image/upload/v1746330867/CARPETA1/Disney%20Universe%2012_22_2024%204_18_43%20PM.png", categoriaId: 1 },
  { id: idCounterproductos++, nombre: "gSilla moderna", descripcion: "Silla de madera con respaldo", precio: 1200, oferta: true, precioOferta: 999, nombreimagenes: "https://res.cloudinary.com/dacrpsl5p/image/upload/v1746330867/CARPETA1/Disney%20Universe%2012_22_2024%204_18_43%20PM.png", categoriaId: 1 },
  { id: idCounterproductos++, nombre: "hMesa redonda", descripcion: "Mesa para comedor", precio: 3500, oferta: false, precioOferta: 0, nombreimagenes: "https://res.cloudinary.com/dacrpsl5p/image/upload/v1746330867/CARPETA1/Disney%20Universe%2012_22_2024%204_18_43%20PM.png", categoriaId: 1 },
  { id: idCounterproductos++, nombre: "jSilla moderna", descripcion: "Silla de madera con respaldo", precio: 1200, oferta: true, precioOferta: 999, nombreimagenes: "https://res.cloudinary.com/dacrpsl5p/image/upload/v1746330867/CARPETA1/Disney%20Universe%2012_22_2024%204_18_43%20PM.png", categoriaId: 1 },
  { id: idCounterproductos++, nombre: "aSilla moderna", descripcion: "Silla de madera con respaldo", precio: 1200, oferta: true, precioOferta: 999, nombreimagenes: "https://res.cloudinary.com/dacrpsl5p/image/upload/v1746330867/CARPETA1/Disney%20Universe%2012_22_2024%204_18_43%20PM.png", categoriaId: 1 },
  { id: idCounterproductos++, nombre: "xSilla moderna", descripcion: "Silla de madera con respaldo", precio: 1200, oferta: true, precioOferta: 999, nombreimagenes: "https://res.cloudinary.com/dacrpsl5p/image/upload/v1746330867/CARPETA1/Disney%20Universe%2012_22_2024%204_18_43%20PM.png", categoriaId: 1 },
  { id: idCounterproductos++, nombre: "bSilla moderna", descripcion: "Silla de madera con respaldo", precio: 1200, oferta: true, precioOferta: 999, nombreimagenes: "https://res.cloudinary.com/dacrpsl5p/image/upload/v1746330867/CARPETA1/Disney%20Universe%2012_22_2024%204_18_43%20PM.png", categoriaId: 1 },
  { id: idCounterproductos++, nombre: "cMesa redonda", descripcion: "Mesa para comedor", precio: 3500, oferta: false, precioOferta: 0, nombreimagenes: "https://res.cloudinary.com/dacrpsl5p/image/upload/v1746330867/CARPETA1/Disney%20Universe%2012_22_2024%204_18_43%20PM.png", categoriaId: 1 },
  { id: idCounterproductos++, nombre: "dSilla moderna", descripcion: "Silla de madera con respaldo", precio: 1200, oferta: true, precioOferta: 999, nombreimagenes: "https://res.cloudinary.com/dacrpsl5p/image/upload/v1746330867/CARPETA1/Disney%20Universe%2012_22_2024%204_18_43%20PM.png", categoriaId: 1 },
  { id: idCounterproductos++, nombre: "fMesa redonda", descripcion: "Mesa para comedor", precio: 3500, oferta: false, precioOferta: 0, nombreimagenes: "https://res.cloudinary.com/dacrpsl5p/image/upload/v1746330867/CARPETA1/Disney%20Universe%2012_22_2024%204_18_43%20PM.png", categoriaId: 1 },
  { id: idCounterproductos++, nombre: "gSilla moderna", descripcion: "Silla de madera con respaldo", precio: 1200, oferta: true, precioOferta: 999, nombreimagenes: "https://res.cloudinary.com/dacrpsl5p/image/upload/v1746330867/CARPETA1/Disney%20Universe%2012_22_2024%204_18_43%20PM.png", categoriaId: 1 },
  { id: idCounterproductos++, nombre: "hMesa redonda", descripcion: "Mesa para comedor", precio: 3500, oferta: false, precioOferta: 0, nombreimagenes: "https://res.cloudinary.com/dacrpsl5p/image/upload/v1746330867/CARPETA1/Disney%20Universe%2012_22_2024%204_18_43%20PM.png", categoriaId: 1 },
  { id: idCounterproductos++, nombre: "jSilla moderna", descripcion: "Silla de madera con respaldo", precio: 1200, oferta: true, precioOferta: 999, nombreimagenes: "https://res.cloudinary.com/dacrpsl5p/image/upload/v1746330867/CARPETA1/Disney%20Universe%2012_22_2024%204_18_43%20PM.png", categoriaId: 1 },
];

let idCounterCategoria = 1;

window.categorias = [
  { id: idCounterCategoria++, nombre: "Recámara", descripcion: "Conjuntos de recámaras elegantes y modernas para todo tipo de gustos", imagen: "https://res.cloudinary.com/dacrpsl5p/image/upload/v1746602887/categorias/Recamara.png" },
  { id: idCounterCategoria++, nombre: "Comedor", descripcion: "Comedores funcionales y estilosos ideales para reuniones familiares", imagen: "https://res.cloudinary.com/dacrpsl5p/image/upload/v1746602859/categorias/Comedor.png" },
  { id: idCounterCategoria++, nombre: "Mesa", descripcion: "Mesas de comedor, centro y auxiliares con diseños contemporáneos", imagen: "https://res.cloudinary.com/dacrpsl5p/image/upload/v1746602875/categorias/Mesa.png" },
  { id: idCounterCategoria++, nombre: "Escritorios", descripcion: "Escritorios funcionales para estudio u oficina en casa", imagen: "https://res.cloudinary.com/dacrpsl5p/image/upload/v1746602864/categorias/Escritorio.png" },
  { id: idCounterCategoria++, nombre: "Closets", descripcion: "Closets empotrables y armables para mejor organización", imagen: "https://res.cloudinary.com/dacrpsl5p/image/upload/v1746636802/categorias/Closets.png" },
  { id: idCounterCategoria++, nombre: "Muebles TV", descripcion: "Muebles ideales para colocar pantallas y equipos de entretenimiento", imagen: "https://res.cloudinary.com/dacrpsl5p/image/upload/v1746602881/categorias/PortaTV.png" },
  { id: idCounterCategoria++, nombre: "Espejo", descripcion: "Espejos decorativos y funcionales para cualquier espacio del hogar", imagen: "https://res.cloudinary.com/dacrpsl5p/image/upload/v1746602870/categorias/Espejo.png" },
  { id: idCounterCategoria++, nombre: "Tocador", descripcion: "Tocadores con espejo y cajones para organizar artículos personales", imagen: "https://res.cloudinary.com/dacrpsl5p/image/upload/v1746602895/categorias/Tocador.png" },
  { id: idCounterCategoria++, nombre: "Silla", descripcion: "Sillas modernas, cómodas y elegantes para comedor u oficina", imagen: "https://res.cloudinary.com/dacrpsl5p/image/upload/v1746602906/categorias/Silla.png" },
  { id: idCounterCategoria++, nombre: "Bufetero", descripcion: "Muebles auxiliares para guardar utensilios o complementar el comedor", imagen: "https://res.cloudinary.com/dacrpsl5p/image/upload/v1746602838/categorias/Bufetero.png" },
  { id: idCounterCategoria++, nombre: "Buró", descripcion: "Muebles pequeños para recámara con cajones y acabados modernos", imagen: "https://res.cloudinary.com/dacrpsl5p/image/upload/v1746602853/categorias/Buro1.png" },
  { id: idCounterCategoria++, nombre: "Silla / Sillón", descripcion: "Sillas y sillones de descanso o decorativos con estilo moderno", imagen: "https://res.cloudinary.com/dacrpsl5p/image/upload/v1746636693/categorias/sillasillon.png" },
  { id: idCounterCategoria++, nombre: "Sillón", descripcion: "Sillones confortables para sala o recámara con diseños variados", imagen: "https://res.cloudinary.com/dacrpsl5p/image/upload/v1746636681/categorias/living-room_6151311.png" },
  { id: idCounterCategoria++, nombre: "Cajonera", descripcion: "Muebles con cajones para almacenamiento funcional en cualquier espacio", imagen: "https://res.cloudinary.com/dacrpsl5p/image/upload/v1746636998/categorias/Cajonera.png" },
  { id: idCounterCategoria++, nombre: "Bancos", descripcion: "Bancos altos y bajos ideales para desayunadores o barras", imagen: "https://res.cloudinary.com/dacrpsl5p/image/upload/v1746636655/categorias/banco.png" },
  { id: idCounterCategoria++, nombre: "Credenza", descripcion: "Muebles elegantes para almacenamiento en sala o comedor", imagen: "https://res.cloudinary.com/dacrpsl5p/image/upload/v1746636710/categorias/Credenza.png" },
  { id: idCounterCategoria++, nombre: "Baúl", descripcion: "Baúles decorativos y funcionales para almacenamiento adicional", imagen: "https://res.cloudinary.com/dacrpsl5p/image/upload/v1746636644/categorias/baul.png" },
  { id: idCounterCategoria++, nombre: "Píe de cama", descripcion: "Bancos y muebles decorativos al pie de cama", imagen: "https://res.cloudinary.com/dacrpsl5p/image/upload/v1746636729/categorias/Piedecama.png" },
  { id: idCounterCategoria++, nombre: "Torres", descripcion: "Torres laterales para recámara o almacenamiento vertical", imagen: "https://res.cloudinary.com/dacrpsl5p/image/upload/v1746636675/categorias/Torre.png" },
  { id: idCounterCategoria++, nombre: "Juguetero", descripcion: "Mueble organizador ideal para guardar juguetes y objetos pequeños", imagen: "https://res.cloudinary.com/dacrpsl5p/image/upload/v1746636669/categorias/shelf.png" }
];

let idCounterComentarios = 1;
window.comentarios = [
  { id: idCounterComentarios++, usuarioId: 1, productoId: 1, texto: "Muy cómodo y elegante", estrellas: 5 },
  { id: idCounterComentarios++, usuarioId: 1, productoId: 1, texto: "Lo volvería a comprar", estrellas: null }, // sin duplicar estrellas
  { id: idCounterComentarios++, usuarioId: 2, productoId: 1, texto: "Me llegó en buen estado", estrellas: 4 },
];

let idCounter = 1;

window.usuarios = [
  { id: idCounter++, nombre: 'Juan Pérez', correo: 'juan@correo.com', telefono: '1234567890', contrasena: '1234' },
  { id: idCounter++, nombre: 'Ana Gómez', correo: 'ana@correo.com', telefono: '0987654321', contrasena: '5678' },
  { id: idCounter++, nombre: 'Carlos Ruiz', correo: 'carlos@correo.com', telefono: '1122334455', contrasena: 'abcd' },
  { id: idCounter++, nombre: 'Laura Martínez', correo: 'laura@correo.com', telefono: '5566778899', contrasena: 'efgh' },
  { id: idCounter++, nombre: 'Pedro Sánchez', correo: 'pedro@correo.com', telefono: '6677889900', contrasena: 'ijkl' },
  { id: idCounter++, nombre: 'María López', correo: 'maria@correo.com', telefono: '2233445566', contrasena: 'mnop' },
  { id: idCounter++, nombre: 'José Pérez', correo: 'jose@correo.com', telefono: '3344556677', contrasena: 'qrst' }
];
*/

function editarProducto(producto) {
  localStorage.setItem("productoEditar", JSON.stringify(producto));
}