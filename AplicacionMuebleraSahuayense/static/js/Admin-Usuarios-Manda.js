document.addEventListener("DOMContentLoaded", async () => {
    let pedidos = [];
    let estadoActivo = "todos";
    let pedidosMostrados = [];

    const container = document.getElementById("pedidos-container");
    const inputBuscar = document.getElementById("um-input-buscar");

    console.log("📦 DOMContentLoaded - Script iniciado");
    await cargarPedidosDesdeAPI();

    async function cargarPedidosDesdeAPI() {
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch("/encargos/todos/", {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("Error al cargar pedidos");
            pedidos = await res.json();
            console.log("✅ Pedidos cargados:", pedidos);
            renderPedidos(filtrarPedidos());
        } catch (error) {
            console.error("❌ Error cargando pedidos:", error);
            container.innerHTML = `<p class="um-empty-state">❌ No se pudieron cargar los pedidos</p>`;
        }
    }

    function crearPedidoHTML(pedido) {
        const nombreUsuario = pedido.usuario_nombre || 'Desconocido';
        const correoUsuario = pedido.usuario_correo || 'No proporcionado';
        const telefonoUsuario = pedido.usuario_telefono || 'No proporcionado';
        const btnPapelera = pedido.estado !== 'papelera'
            ? `<button type="button" class="um-btn-papelera" data-id="${pedido.id}">
           <i class="fas fa-trash"></i> Papelera
       </button>`
            : '';

        const productosHTML = (pedido.productos_encargados || []).map(p => {
            const imgUrl = p.imagen || 'https://via.placeholder.com/100';
            const nombreProducto = p.producto.nameFurniture || 'Sin nombre';
            const cantidad = p.cantidad || 0;
            const precio = Number(p.precio_unitario).toFixed(2) || '0.00';
            return `
        <li class="um-producto-item">
            <a href="/productos_vista/?producto_id=${p.producto.id}" target="_blank">
                <img src="${imgUrl}" alt="${nombreProducto}" class="um-producto-img" style="cursor:pointer;">
            </a>

            <div class="um-producto-info">
                <h4>${nombreProducto}</h4>
                <span class="um-producto-detalle">${cantidad} × $${precio}</span>
            </div>
        </li>
    `;
        }).join('');

        const puedeEliminar = (pedido.estado === 'entregado' || pedido.estado === 'papelera');
        const btnEliminar = puedeEliminar
            ? `<button type="button" class="um-btn-eliminar" data-id="${pedido.id}">
                  <i class="fas fa-trash-alt"></i> Eliminar
               </button>`
            : '';

        const estadosPosibles = ['pendiente', 'procesado', 'enviado', 'entregado', 'cancelado'];
        const opcionesEstado = estadosPosibles.map(est =>
            `<option value="${est}" ${pedido.estado === est ? 'selected' : ''}>${est.charAt(0).toUpperCase() + est.slice(1)}</option>`
        ).join('');

        return `
            <article class="um-pedido-card estado-${pedido.estado}" data-id="${pedido.id}">

                <header class="um-pedido-header">
                    <div class="um-pedido-id">#${pedido.id}</div>
                    <time>${new Date(pedido.fecha).toLocaleDateString('es-ES', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        })}</time>
                </header>

                <div class="um-usuario-info">
                    <div class="um-info-item"><i class="fas fa-user um-fas"></i> ${nombreUsuario}</div>
                    <div class="um-info-item"><i class="fas fa-envelope um-fas"></i> ${correoUsuario}</div>
                    <div class="um-info-item"><i class="fas fa-phone um-fas"></i> ${telefonoUsuario}</div>
                    <div class="um-info-item"><i class="fas fa-map-marker-alt um-fas"></i> ${pedido.ubicacion_entrega}</div>

                </div>

                <ul class="um-productos-lista">${productosHTML}</ul>

                <footer class="um-pedido-footer">
                    <button type="button" class="um-btn-pdf" data-id="${pedido.id}">
                        <i class="fas fa-file-pdf"></i> Generar PDF
                    </button>

                    <label for="estado-select-${pedido.id}">Estado:</label>
                    <select class="um-select-estado" id="estado-select-${pedido.id}" data-id="${pedido.id}">
                        ${opcionesEstado}
                    </select>

                    ${btnPapelera}



                    ${btnEliminar}

                    <div class="um-total-container">
                        <span class="um-total-label">Total:</span>
                        <span class="um-total-precio">$${Number(pedido.total).toFixed(2)}</span>
                    </div>
                </footer>
            </article>
        `;
    }

    function eliminarPedido(id) {
        pedidos = pedidos.filter(p => parseInt(p.id) !== parseInt(id));
        console.log(`🗑 Pedido #${id} eliminado visualmente`);
    }

    function renderPedidos(lista) {
        container.innerHTML = '';
        if (lista.length === 0) {
            container.innerHTML = `<p class="um-empty-state">📭 No se encontraron pedidos</p>`;
            console.log("📭 Lista vacía tras filtro");
            return;
        }
        lista.forEach(pedido => {
            const div = document.createElement('div');
            div.innerHTML = crearPedidoHTML(pedido);
            container.appendChild(div.firstElementChild);
        });
        console.log(`🖨 Se renderizaron ${lista.length} pedidos`);
    }

    function filtrarPedidos() {
        const texto = inputBuscar.value.toLowerCase().trim();
        const filtrados = pedidos.filter(pedido => {
            const coincideTexto = (
                pedido.id.toString().includes(texto) ||
                (pedido.usuario_nombre || '').toLowerCase().includes(texto) ||
                (pedido.usuario_correo || '').toLowerCase().includes(texto) ||
                (pedido.usuario_telefono || '').includes(texto)
            );
            const coincideEstado = estadoActivo === 'todos' || pedido.estado === estadoActivo;
            return coincideTexto && coincideEstado;
        });
        console.log(`🔍 Filtrados (${estadoActivo}):`, filtrados);
        return filtrados;
    }

    inputBuscar.addEventListener("input", () => {
        console.log("⌨ Buscando:", inputBuscar.value);
        renderPedidos(filtrarPedidos());
    });

    container.addEventListener('click', (e) => {
        if (e.target.closest('.um-btn-eliminar')) {
            const boton = e.target.closest('.um-btn-eliminar');
            const id = parseInt(boton.dataset.id);
            if (!isNaN(id)) {
                eliminarPedido(id);
                renderPedidos(filtrarPedidos());
            }
        } else if (e.target.closest('.um-btn-pdf')) {
            const botonPDF = e.target.closest('.um-btn-pdf');
            const id = parseInt(botonPDF.dataset.id);
            if (!isNaN(id)) {
                const pedido = pedidos.find(p => p.id === id);
                if (pedido) {
                    generarPDF(pedido);
                } else {
                    mostrarToast('Pedido no encontrado para generar PDF', 'error');
                }
            }
        }
    });


    container.addEventListener('change', async (e) => {
        if (e.target.classList.contains('um-select-estado')) {
            const select = e.target;
            const nuevoEstado = select.value;
            const pedidoId = select.dataset.id;

            try {
                const token = localStorage.getItem("accessToken");
                const res = await fetch(`/encargos/${pedidoId}/cambiar-estado/`, {
                    method: 'PATCH',
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ estado: nuevoEstado })
                });

                if (!res.ok) throw new Error('No se pudo cambiar el estado');

                const pedido = pedidos.find(p => p.id == pedidoId);
                if (pedido) pedido.estado = nuevoEstado;
                renderPedidos(filtrarPedidos());


                console.log(`✅ Estado pedido #${pedidoId} actualizado a '${nuevoEstado}'`);
            } catch (error) {
                mostrarToast('Error al actualizar estado: ' + error.message, 'error');
                const pedido = pedidos.find(p => p.id == pedidoId);
                if (pedido) select.value = pedido.estado;
            }
        }
    });

    document.querySelectorAll(".filtro-estado").forEach(btn => {
        btn.addEventListener("click", () => {
            estadoActivo = btn.dataset.estado;
            console.log(`📂 Filtro cambiado a: ${estadoActivo}`);
            renderPedidos(filtrarPedidos());
        });
    });


    document.addEventListener("click", async function (e) {
        if (e.target.closest(".um-btn-papelera")) {
            const btn = e.target.closest(".um-btn-papelera");
            const encargoId = btn.dataset.id;

            const confirmar = confirm("¿Estás seguro de mover este pedido a la papelera?");
            if (!confirmar) return;

            try {
                const res = await fetch(`/encargos/mover-a-papelera/${encargoId}/`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
                        "Content-Type": "application/json"
                    }
                });

                if (!res.ok) {
                    const error = await res.json();
                    throw new Error(error.error || "No se pudo mover a papelera");
                }

                const data = await res.json();
                mostrarToast(data.mensaje || "Encargo movido a papelera", "success");

                const index = pedidos.findIndex(p => p.id == encargoId);
                if (index !== -1) {
                    pedidos[index].estado = "papelera";
                    renderPedidos(filtrarPedidos());  // Vuelve a renderizar con los datos actualizados
                }

            } catch (err) {
                console.error("Error al mover a papelera:", err);
                mostrarToast("Ocurrió un error al mover el pedido a la papelera.", "error");
            }
        }
    });

    document.getElementById("btn-vaciar-papelera").addEventListener("click", async () => {
        const confirmar = confirm("¿Estás seguro de eliminar todos los pedidos en papelera?");
        if (!confirmar) return;

        try {
            mostrarSpinner();
            const res = await fetch("/encargos/papelera/eliminar/", {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
                    "Content-Type": "application/json"
                }
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "No se pudo eliminar la papelera");
            }

            const data = await res.json();
            mostrarToast(data.mensaje || "Papelera vaciada", "success");


            if (typeof cargarEncargos === "function") {
                await cargarEncargos();
            } else {
                location.reload();
            }

        } catch (err) {
            console.error("Error al eliminar papelera:", err);
            mostrarToast("Ocurrió un error al eliminar pedidos de la papelera.", "error");
        } finally {
            ocultarSpinner();
        }
    });
    document.addEventListener("click", async function (e) {
        if (e.target.closest(".um-btn-eliminar")) {
            const btn = e.target.closest(".um-btn-eliminar");
            const encargoId = btn.dataset.id;

            const confirmar = confirm("¿Estás seguro de eliminar este pedido? Esta acción no se puede deshacer.");
            if (!confirmar) return;

            try {
                mostrarSpinner();
                const res = await fetch(`/encargos/eliminar/${encargoId}/`, {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
                        "Content-Type": "application/json"
                    }
                });

                if (!res.ok) {
                    const error = await res.json();
                    throw new Error(error.error || "No se pudo eliminar el encargo");
                }

                const data = await res.json();
                mostrarToast(data.mensaje || "Encargo eliminado correctamente", "success");


                if (typeof cargarEncargos === "function") {
                    await cargarEncargos();
                } else {
                    // location.reload();
                }

            } catch (err) {
                console.error("Error al eliminar el encargo:", err);
                mostrarToast("Ocurrió un error al eliminar el encargo.", "error");
            }
            finally {
            ocultarSpinner(); // siempre se oculta el spinner
        }
        }
    });

    async function obtenerImagenBase64(url) {
        const response = await fetch(url);
        const blob = await response.blob();

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    async function generarPDF(pedido) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        const logoUrl = 'https://res.cloudinary.com/dacrpsl5p/image/upload/v1745430695/Logo-Negro_nfvywi.png';

        let logoBase64;
        try {
            logoBase64 = await obtenerImagenBase64(logoUrl);
        } catch (e) {
            console.warn('No se pudo cargar el logo:', e);
        }

        let headerHeight = 0;

        if (logoBase64) {
            const imgProps = doc.getImageProperties(logoBase64);
            const logoWidth = 40;
            const logoHeight = (imgProps.height * logoWidth) / imgProps.width;
            const x = 14;
            const y = 10;

            doc.addImage(logoBase64, 'PNG', x, y, logoWidth, logoHeight);

            headerHeight = y + logoHeight + 5;

            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.5);
            doc.line(14, headerHeight, doc.internal.pageSize.getWidth() - 14, headerHeight);
        }

        let posY = headerHeight + 10;

        doc.setFontSize(18);
        doc.text(`Pedido #${pedido.id}`, 14, posY);

        posY += 10;
        const fechaStr = new Date(pedido.fecha).toLocaleString('es-ES');
        doc.setFontSize(12);
        doc.text(`Fecha: ${fechaStr}`, 14, posY);

        posY += 10;
        doc.text(`Usuario: ${pedido.usuario_nombre || 'Desconocido'}`, 14, posY);
        posY += 7;
        doc.text(`Correo: ${pedido.usuario_correo || 'No proporcionado'}`, 14, posY);
        posY += 7;
        doc.text(`Teléfono: ${pedido.usuario_telefono || 'No proporcionado'}`, 14, posY);
        posY += 7;
        doc.text(`Ubicacion: ${pedido.ubicacion_entrega || 'No proporcionado'}`, 14, posY);

        if (estadoActivo === "todos") {
            posY += 7;
            doc.text(`Estado: ${pedido.estado || 'Sin estado'}`, 14, posY);
        }

        posY += 12;

        const columnas = [
            { header: 'Producto', dataKey: 'producto' },
            { header: 'Cantidad', dataKey: 'cantidad' },
            { header: 'Precio Original', dataKey: 'precio_original' },
            { header: '% Descuento', dataKey: 'descuento' },
            { header: 'Precio Descuento', dataKey: 'precio_descuento' },
            { header: 'Subtotal', dataKey: 'subtotal' }
        ];

        const productos = pedido.productos_encargados || [];

        // Validar si hay productos con todos los valores 0
        const hayProductoConCamposCero = productos.some(p => {
            const prod = p.producto || {};
            const precioOriginal = Number(prod.priceFurniture || 0);
            const porcentajeDescuento = Number(prod.porcentajeDescuento || 0);
            const precioDescuento = (!isNaN(prod.PrecioOferta) && prod.PrecioOferta !== null)
                ? Number(prod.PrecioOferta)
                : precioOriginal;
            return precioOriginal === 0 && porcentajeDescuento === 0 && precioDescuento === 0;
        });

        const filas = productos.map(p => {
            const producto = p.producto || {};
            const cantidad = Number(p.cantidad) || 0;

            const precioOriginal = Number(producto.priceFurniture || 0);
            const porcentajeDescuento = Number(producto.porcentajeDescuento || 0);
            const precioDescuento = (!isNaN(producto.PrecioOferta) && producto.PrecioOferta !== null)
                ? Number(producto.PrecioOferta)
                : precioOriginal;

            const subtotal = porcentajeDescuento === 0
                ? precioOriginal * cantidad
                : precioDescuento * cantidad;

            const camposSinValor = (precioOriginal === 0 && porcentajeDescuento === 0 && precioDescuento === 0);

            return {
                producto: producto.nameFurniture || 'Sin nombre',
                cantidad: cantidad.toString(),
                precio_original: camposSinValor ? 'No definido' : `$${precioOriginal.toFixed(2)}`,
                descuento: camposSinValor ? 'No definido' : `${porcentajeDescuento}%`,
                precio_descuento: camposSinValor ? 'No definido' : `$${precioDescuento.toFixed(2)}`,
                subtotal: camposSinValor ? 'No definido' : `$${subtotal.toFixed(2)}`
            };
        });

        doc.autoTable({
            startY: posY,
            head: [columnas.map(col => col.header)],
            body: filas.map(fila => columnas.map(col => fila[col.dataKey])),
            styles: { fontSize: 10 },
            headStyles: { fillColor: [73, 84, 104] },
            margin: { left: 14, right: 14 }
        });

        const finalY = doc.lastAutoTable.finalY + 10 || posY + 50;
        doc.setFontSize(14);

        if (hayProductoConCamposCero) {
            doc.text("Póngase en contacto con la empresa", 14, finalY);
        } else {
            doc.text(`Total: $${Number(pedido.total).toFixed(2)}`, 14, finalY);
        }

        doc.save(`pedido_${pedido.id}.pdf`);
        mostrarToast(`PDF del pedido #${pedido.id} generado correctamente.`, 'success');
    }



    document.getElementById("um-exportar-todos").addEventListener("click", async () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const logoUrl = 'https://res.cloudinary.com/dacrpsl5p/image/upload/v1745430695/Logo-Negro_nfvywi.png';

        let logoBase64;
        try {
            logoBase64 = await obtenerImagenBase64(logoUrl);
        } catch (e) {
            console.warn('No se pudo cargar el logo:', e);
        }

        const pedidosAExportar = pedidos.filter(p => {
            const coincideEstado = estadoActivo === "todos" || p.estado === estadoActivo;
            return coincideEstado && p.estado !== "carrito";
        });

        if (pedidosAExportar.length === 0) {
            mostrarToast("No hay pedidos para exportar.", "info");
            return;
        }

        for (let i = 0; i < pedidosAExportar.length; i++) {
            const pedido = pedidosAExportar[i];

            let headerHeight = 0;
            if (logoBase64) {
                const imgProps = doc.getImageProperties(logoBase64);
                const logoWidth = 40;
                const logoHeight = (imgProps.height * logoWidth) / imgProps.width;
                const x = 14;
                const y = 10;

                doc.addImage(logoBase64, 'PNG', x, y, logoWidth, logoHeight);
                headerHeight = y + logoHeight + 5;
                doc.setDrawColor(0, 0, 0);
                doc.setLineWidth(0.5);
                doc.line(14, headerHeight, doc.internal.pageSize.getWidth() - 14, headerHeight);
            }

            let posY = headerHeight + 10;

            doc.setFontSize(18);
            doc.text(`Pedido #${pedido.id}`, 14, posY);

            posY += 10;
            const fechaStr = new Date(pedido.fecha).toLocaleString('es-ES');
            doc.setFontSize(12);
            doc.text(`Fecha: ${fechaStr}`, 14, posY);

            posY += 10;
            doc.text(`Usuario: ${pedido.usuario_nombre || 'Desconocido'}`, 14, posY);
            posY += 7;
            doc.text(`Correo: ${pedido.usuario_correo || 'No proporcionado'}`, 14, posY);
            posY += 7;
            doc.text(`Teléfono: ${pedido.usuario_telefono || 'No proporcionado'}`, 14, posY);
            posY += 7;
            doc.text(`Ubicacion: ${pedido.ubicacion_entrega || 'No proporcionado'}`, 14, posY);


            posY += 7;
            if (estadoActivo === "todos" && pedido.estado !== "papelera") {
                posY += 7;
                doc.text(`Estado: ${pedido.estado || 'Sin estado'}`, 14, posY);
            }

            posY += 12;

            const columnas = [
                { header: 'Producto', dataKey: 'producto' },
                { header: 'Cantidad', dataKey: 'cantidad' },
                { header: 'Precio Original', dataKey: 'precio_original' },
                { header: '% Descuento', dataKey: 'descuento' },
                { header: 'Precio Descuento', dataKey: 'precio_descuento' },
                { header: 'Subtotal', dataKey: 'subtotal' }
            ];

            const productos = pedido.productos_encargados || [];

            // Aquí la clave: detectamos si existe algún producto con todos valores en 0
            const hayProductoConCamposCero = productos.some(p => {
                const prod = p.producto || {};
                const precioOriginal = Number(prod.priceFurniture || 0);
                const porcentajeDescuento = Number(prod.porcentajeDescuento || 0);
                const precioDescuento = (!isNaN(prod.PrecioOferta) && prod.PrecioOferta !== null)
                    ? Number(prod.PrecioOferta)
                    : precioOriginal;
                // Si todos ceros
                return precioOriginal === 0 && porcentajeDescuento === 0 && precioDescuento === 0;
            });

            const filas = productos.map(p => {
                const producto = p.producto || {};
                const cantidad = Number(p.cantidad) || 0;

                const precioOriginal = Number(producto.priceFurniture || 0);
                const porcentajeDescuento = Number(producto.porcentajeDescuento || 0);
                const precioDescuento = (!isNaN(producto.PrecioOferta) && producto.PrecioOferta !== null)
                    ? Number(producto.PrecioOferta)
                    : precioOriginal;

                const subtotal = porcentajeDescuento === 0
                    ? precioOriginal * cantidad
                    : precioDescuento * cantidad;

                const camposSinValor = (precioOriginal === 0 && porcentajeDescuento === 0 && precioDescuento === 0);

                return {
                    producto: producto.nameFurniture || 'Sin nombre',
                    cantidad: cantidad.toString(),
                    precio_original: camposSinValor ? 'No definido' : `$${precioOriginal.toFixed(2)}`,
                    descuento: camposSinValor ? 'No definido' : `${porcentajeDescuento}%`,
                    precio_descuento: camposSinValor ? 'No definido' : `$${precioDescuento.toFixed(2)}`,
                    subtotal: camposSinValor ? 'No definido' : `$${subtotal.toFixed(2)}`
                };
            });

            doc.autoTable({
                startY: posY,
                head: [columnas.map(col => col.header)],
                body: filas.map(fila => columnas.map(col => fila[col.dataKey])),
                styles: { fontSize: 10 },
                headStyles: { fillColor: [73, 84, 104] },
                margin: { left: 14, right: 14 }
            });

            const finalY = doc.lastAutoTable.finalY + 10 || posY + 50;
            doc.setFontSize(14);

            if (hayProductoConCamposCero) {
                // Si hay al menos un producto con 0 en todos los valores
                doc.text("Póngase en contacto con la empresa", 14, finalY);
            } else {
                // Caso normal, muestra total normal
                doc.text(`Total: $${Number(pedido.total).toFixed(2)}`, 14, finalY);
            }

            if (i < pedidosAExportar.length - 1) {
                doc.addPage();
            }
        }

        doc.save(`pedidos_${estadoActivo}.pdf`);
        mostrarToast(`PDF con todos los pedidos (${estadoActivo}) generado correctamente.`, 'success');
    });

});


document.addEventListener('DOMContentLoaded', function () {
    const filtros = document.querySelectorAll('.filtro-estado');
    const btnVaciarPapelera = document.getElementById('btn-vaciar-papelera');

    // Configuración inicial
    btnVaciarPapelera.classList.remove('visible');

    filtros.forEach(filtro => {
        filtro.addEventListener('click', function () {
            // 1. Manejar estado activo de los filtros
            filtros.forEach(f => f.classList.remove('active'));
            this.classList.add('active');

            // 2. Mostrar/ocultar botón de papelera
            if (this.getAttribute('data-estado') === 'papelera') {
                btnVaciarPapelera.classList.add('visible');
            } else {
                btnVaciarPapelera.classList.remove('visible');
            }
        });
    });
});

filtros.forEach(filtro => {
    filtro.addEventListener('click', function () {
        filtros.forEach(f => f.classList.remove('active'));
        this.classList.add('active');

        if (this.getAttribute('data-estado') === 'papelera') {
            btnVaciarPapelera.classList.add('visible');
        } else {
            btnVaciarPapelera.classList.remove('visible');
        }
    });
});
