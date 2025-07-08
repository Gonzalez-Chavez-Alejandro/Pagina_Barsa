let productos = [];
let categorias = [];
let categoriaSeleccionada = "all";

document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Cargar productos desde la API
        const responseProductos = await fetch("/productos/publicos/");
        const dataProductos = await responseProductos.json();

        productos = dataProductos.map(p => {
            const imagenes = p.imageFurniture ? p.imageFurniture.split(",") : [];
            return {
                id: p.id,
                nombre: p.nameFurniture,
                descripcion: p.descriptionFurniture,
                precio: p.priceFurniture,
                precioOferta: p.PrecioOferta,
                descuento: p.porcentajeDescuento,
                nombreimagenes: p.imageFurniture,
                imagen: imagenes[0] || "https://via.placeholder.com/300x180",
                oferta: p.porcentajeDescuento > 0,
                categoriaIds: p.categoryID || [],
                categoriasNombres: p.categorias_nombres,
            };
        });

        // Cargar categorías desde la API
        const responseCategorias = await fetch("/categorias/publicas/");
        const dataCategorias = await responseCategorias.json();

        categorias = dataCategorias.map(c => ({
            id: c.id,
            nombre: c.nameCategory
        }));

        // Leer categoría de la URL
        const categoriaEnUrl = getQueryParam("categoria");
        if (categoriaEnUrl && categorias.some(c => c.id == categoriaEnUrl)) {
            categoriaSeleccionada = Number(categoriaEnUrl);
        } else {
            categoriaSeleccionada = "all";
        }

        renderCategorias();
        aplicarFiltros();

    } catch (error) {
        console.error("Error al cargar productos o categorías:", error);
        mostrarToast("Error al cargar productos.", "error");
        document.getElementById("contenedor-productos").innerHTML = "<p>Error al cargar productos.</p>";
    }

    // Activar filtro por búsqueda
    document.getElementById("buscador").addEventListener("input", aplicarFiltros);
});

// Función para leer parámetros GET de la URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

function renderTarjetas(lista = productos) {
    const contenedor = document.getElementById("contenedor-productos");
    contenedor.innerHTML = "";

    if (lista.length === 0) {
        contenedor.innerHTML = "<p>No se encontraron productos.</p>";
        return;
    }

    lista.forEach(p => {
        const div = document.createElement("div");
        div.className = "tarjeta-producto";

        const imagen = (p.nombreimagenes?.split(",")[0] || p.imagen || "https://via.placeholder.com/300x180").trim();
        const precio = Number(p.precio);
        const precioOferta = Number(p.precioOferta);
        const precioInvalido = isNaN(precio) || precio <= 0;

        let precioHTML = "";
        let descuento = 0;
        let ahorro = 0;

        if (p.oferta && !isNaN(precioOferta) && precioOferta > 0) {
            precioHTML = `<span class="oferta">$${precioOferta}</span> <del>$${precio}</del>`;
            descuento = Math.round(((precio - precioOferta) / precio) * 100);
            ahorro = precio - precioOferta;
        } else if (precioInvalido) {
            precioHTML = `<span class="contactar">Póngase en contacto</span>`;
        } else {
            precioHTML = `<span class="oferta">$${precio}</span>`;
        }

        div.innerHTML = `
            ${descuento > 0 ? `<div class="descuento">${descuento}%</div>` : ''}
            <img src="${imagen}" alt="${p.nombre}">
            <div class="contenido">
                <h2 class="nombre">${p.nombre}</h2>
                <p class="descripcion">${p.descripcion}</p>
                <div class="precio">${precioHTML}</div>
                <div class="ahorro-boton">
                    ${descuento > 0 ? `<div class="ahorro">Ahorras $${ahorro.toFixed(2)}</div>` : ''}                   
                    <button class="btn-carrito" onclick="enviarpagina(${p.id})">Ver Producto</button>
                </div>
            </div>
        `;

        contenedor.appendChild(div);
    });
}

function renderCategorias() {
    const listaCat = document.getElementById("lista-categorias");
    if (!listaCat) return;

    listaCat.innerHTML = "";

    // Agregar opción "Todas"
    const liAll = document.createElement("li");
    liAll.textContent = "Todas";
    liAll.dataset.id = "all";
    if (categoriaSeleccionada === "all") {
        liAll.classList.add("categoria-activa");
    }
    liAll.onclick = () => {
        categoriaSeleccionada = "all";
        document.querySelectorAll("#lista-categorias li").forEach(el => el.classList.remove("categoria-activa"));
        liAll.classList.add("categoria-activa");
        aplicarFiltros();
    };
    listaCat.appendChild(liAll);

    categorias.forEach(cat => {
        const li = document.createElement("li");
        li.textContent = cat.nombre;
        li.dataset.id = cat.id;
        if (cat.id === categoriaSeleccionada) {
            li.classList.add("categoria-activa");
        }
        li.onclick = () => {
            categoriaSeleccionada = cat.id;
            document.querySelectorAll("#lista-categorias li").forEach(el => el.classList.remove("categoria-activa"));
            li.classList.add("categoria-activa");
            aplicarFiltros();
        };
        listaCat.appendChild(li);
    });
}

function aplicarFiltros() {
    const terminoOriginal = document.getElementById("buscador").value.trim().toLowerCase();
    const termino = removerAcentos(terminoOriginal);

    const lista = productos.filter(p => {
        const nombre = removerAcentos(p.nombre.toLowerCase());
        const descripcion = removerAcentos(p.descripcion.toLowerCase());
        const categoriasTexto = Array.isArray(p.categoriasNombres)
            ? removerAcentos(p.categoriasNombres.join(" ").toLowerCase())
            : "";

        const coincideBusqueda =
            nombre.includes(termino) ||
            descripcion.includes(termino) ||
            categoriasTexto.includes(termino);

        const coincideCategoria =
            categoriaSeleccionada === "all" ||
            p.categoriaIds.includes(Number(categoriaSeleccionada));

        return coincideBusqueda && coincideCategoria;
    });

    renderTarjetas(lista);
}

function removerAcentos(texto) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}


function enviarpagina(id) {
    const producto = productos.find(p => p.id === id);
    if (producto) {
        localStorage.setItem("producto_seleccionado", JSON.stringify(producto));
        window.location.href = `/productos_vista/?producto_id=${id}`;
    }
}