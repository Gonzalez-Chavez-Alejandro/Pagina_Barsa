let imagenesProducto = [];
let indiceActual = 0;

document.getElementById("imagen-grande").addEventListener("click", function () {
    const modal = document.getElementById("modalImagen");
    const modalImg = document.getElementById("imagenModalContenido");
    modal.style.display = "flex";

    indiceActual = imagenesProducto.findIndex(img => img === this.src);
    if (indiceActual === -1) indiceActual = 0;

    modalImg.src = imagenesProducto[indiceActual];
});



function cerrarModalImagen() {
    document.getElementById("modalImagen").style.display = "none";
}
document.getElementById("prev-img").addEventListener("click", () => {
    if (imagenesProducto.length === 0) return;
    indiceActual = (indiceActual - 1 + imagenesProducto.length) % imagenesProducto.length;
    document.getElementById("imagenModalContenido").src = imagenesProducto[indiceActual];
});

document.getElementById("next-img").addEventListener("click", () => {
    if (imagenesProducto.length === 0) return;
    indiceActual = (indiceActual + 1) % imagenesProducto.length;
    document.getElementById("imagenModalContenido").src = imagenesProducto[indiceActual];
});

const detalleNombre = document.getElementById("detalle-nombre");
const detalleDescripcion = document.getElementById("detalle-descripcion");
const detallePrecio = document.getElementById("detalle-precio");
const detallePrecioOriginal = document.getElementById("detalle-precio-original");
const detalleImagen = document.getElementById("imagen-grande");
const detalleAhorro = document.getElementById("detalle-ahorro");
const detallePorcentaje = document.getElementById("detalle-porcentaje");
const miniaturasContainer = document.querySelector(".miniaturas");

const urlParams = new URLSearchParams(window.location.search);
const productoId = parseInt(urlParams.get("producto_id"));

async function cargarProducto() {
    try {
        const response = await fetch("/productos/publicos/");
        if (!response.ok) throw new Error("Error al cargar productos");
        const productos = await response.json();

        const productosMapeados = productos.map(p => ({
            id: p.id,
            nombre: p.nameFurniture,
            descripcion: p.descriptionFurniture,
            precio: p.priceFurniture,
            precioOferta: p.PrecioOferta,
            nombreimagenes: p.imageFurniture,
        }));

        const producto = productosMapeados.find(p => p.id === productoId);
        if (!producto) {
            mostrarError("Producto no encontrado");
            return;
        }

        // Definir variable global para carrito
        window.producto = producto;

        mostrarProducto(producto);
        cargarCategoriasSimilares(producto.id);
    } catch (error) {
        mostrarError("Error al cargar el producto");
        console.error(error);
    }
}


function mostrarProducto(producto) {
    const imagenes = producto.nombreimagenes?.split(",") || [];
    imagenesProducto = imagenes.map(img => img.trim());

    if (imagenes.length > 0) {
        detalleImagen.src = imagenes[0].trim();
        detalleImagen.alt = producto.nombre || "Producto";

        miniaturasContainer.innerHTML = '';
        imagenes.forEach((img, i) => {
            const mini = document.createElement("img");
            mini.src = img.trim();
            mini.alt = `Miniatura ${i + 1}`;
            if (i === 0) mini.classList.add("activa");

            mini.addEventListener("click", () => {
                detalleImagen.src = img.trim();
                document.querySelectorAll(".miniaturas img").forEach(el => el.classList.remove("activa"));
                mini.classList.add("activa");
            });

            miniaturasContainer.appendChild(mini);
        });
    }

    detalleNombre.textContent = producto.nombre || "Sin nombre";
    detalleDescripcion.innerHTML = (producto.descripcion || "Sin descripción").replace(/\n/g, "<br>");


    const precio = parseFloat(producto.precio);
    const oferta = parseFloat(producto.precioOferta);

    if ((!precio || precio <= 0.01) && (!oferta || oferta <= 0.01)) {
        // Sin precio ni oferta válidos
        detallePrecio.textContent = "Póngase en contacto";
        detallePrecioOriginal.style.display = "none";
        detalleAhorro.style.display = "none";
        detallePorcentaje.style.display = "none";
    } else if (oferta > 0 && oferta < precio) {
        // Oferta válida
        detallePrecio.textContent = `$${oferta.toFixed(2)}`;
        detallePrecioOriginal.textContent = `$${precio.toFixed(2)}`;
        detallePrecioOriginal.style.display = "inline";

        const ahorro = precio - oferta;
        const porcentaje = Math.round((ahorro / precio) * 100);
        detalleAhorro.textContent = `Ahorras $${ahorro.toFixed(2)}`;
        detalleAhorro.style.display = "block";
        detallePorcentaje.textContent = `(${porcentaje}% OFF)`;
        detallePorcentaje.style.display = "inline";
    } else {
        // Solo precio sin oferta
        detallePrecio.textContent = `$${precio.toFixed(2)}`;
        detallePrecioOriginal.style.display = "none";
        detalleAhorro.style.display = "none";
        detallePorcentaje.style.display = "none";
    }
}



function mostrarError(msg) {
    document.querySelector(".contenedor-detalle").innerHTML = `
        <p>${msg}</p>
    `;
}

cargarProducto();

async function cargarCategoriasSimilares(productoId) {
    try {
        const responseProducto = await fetch("/productos/publicos/");
        if (!responseProducto.ok) throw new Error("Error al cargar productos");

        const productos = await responseProducto.json();
        const producto = productos.find(p => p.id === productoId);
        if (!producto || !producto.categoryID) return;

        const categoriasDelProducto = producto.categoryID;

        const responseCategorias = await fetch("/categorias/publicas/");
        if (!responseCategorias.ok) throw new Error("Error al cargar categorías");

        const todasCategorias = await responseCategorias.json();
        const categoriasAsociadas = todasCategorias.filter(cat =>
            categoriasDelProducto.includes(cat.id)
        );

        const contenedor = document.getElementById("lista-categorias-similares");
        contenedor.innerHTML = '';

        if (categoriasAsociadas.length === 0) {
            contenedor.innerHTML = "<p>No se encontraron categorías para este producto.</p>";
            return;
        }

        categoriasAsociadas.forEach(cat => {
            const div = document.createElement("div");
            div.className = "categoria-similar";

            let imagen = cat.imagenCategory || "";

            // Extraer URL completa de Cloudinary con regex mejorada
            const urlMatch = imagen.match(/(https:\/\/res\.cloudinary\.com\/[^\s"']+)/);
            if (urlMatch) {
                imagen = urlMatch[1];
            } else {
                imagen = "https://dummyimage.com/100x100/cccccc/969696&text=Sin+imagen";
            }

            div.innerHTML = `
                <img src="${imagen}" alt="${cat.nameCategory}" style="object-fit: cover; border-radius: 6px;" />
                <p>${cat.nameCategory}</p>
            `;

            // Hacer el div clickeable para redirigir a productos filtrados por categoría
            div.style.cursor = "pointer";
            div.addEventListener("click", () => {
                window.location.href = `/productos/?categoria=${cat.id}`;
            });

            contenedor.appendChild(div);
        });

    } catch (error) {
        console.error("Error al cargar categorías similares", error);
    }
}


document.getElementById("agregar-carrito-detalle")?.addEventListener("click", () => {
  
  const usuario = JSON.parse(localStorage.getItem('accessToken'));
  if (!usuario) {
   mostrarToast?.("No estás autenticado. Inicia secion", "error");
   
    setTimeout(() => {
      window.location.href = "/login";
    }, 5000); // espera 2 segundos antes de redirigir
    return;
  }
})

document.getElementById("btn-encargar").addEventListener("click", () => {
  if (carrito.length === 0) {
    mostrarToast("Tu carrito está vacío. Agrega productos antes de encargar.", "error");
    return;
  }

  // Obtener usuario logueado (puedes adaptar según cómo guardes el usuario)
  const usuario = JSON.parse(localStorage.getItem('accessToken'));
  if (!usuario) {
   mostrarToast( "No estás autenticado.");

    window.location.href = "/login"; // O ruta que uses
    return;
  }

  // Crear objeto encargo
  const nuevoEncargo = {
    id: generarIdUnico(), // función para crear id único
    fecha: new Date().toISOString(),
    usuario: {
      correo: usuario.correo || usuario.email,  // asegúrate de que sea consistente con tu objeto usuario
      nombre: usuario.username || usuario.nombre || "Usuario",
      // Puedes agregar más datos si quieres
    },
    productos: carrito.map(item => ({
      id: item.id,
      nombre: item.nombre,
      precio: item.precio,
      cantidad: item.cantidad,
      imagen: item.imagen
    })),
    total: carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0)
  };

  // Leer encargos previos
  let encargos = JSON.parse(localStorage.getItem('encargos')) || [];

  // Agregar nuevo encargo
  encargos.push(nuevoEncargo);

  // Guardar en localStorage
  localStorage.setItem('encargos', JSON.stringify(encargos));

  // Vaciar carrito
  carrito = [];
  guardarCarrito();
  actualizarCarritoUI();

  mostrarToast("Encargo realizado con éxito. Nos pondremos en contacto contigo pronto.", "success");

});

// Función para generar un id único (puedes usar una versión simple)
function generarIdUnico() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}