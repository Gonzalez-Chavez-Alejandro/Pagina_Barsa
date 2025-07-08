document.addEventListener("DOMContentLoaded", () => {
  const menu = document.getElementById("menu-usuario");
  const carritoContainer = document.getElementById("carrito");
  const listaCarrito = document.getElementById("lista-carrito");
  const totalPrecio = document.getElementById("total-precio");
  const btnVaciar = document.getElementById("vaciar-carrito");
  const btnCerrar = document.getElementById("cerrar-carrito");
  const btnEncargar = document.getElementById("btn-encargar");
  const token = localStorage.getItem("accessToken");
  let usuarioActual = null;
  let carritoActual = null;

  // Agregar modal de ubicación
  document.body.insertAdjacentHTML("beforeend", `
    <div id="modal-ubicacion" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background-color:rgba(0,0,0,0.5); z-index:9999; justify-content:center; align-items:center;">
      <div style="background:#fff; padding:20px; border-radius:10px; max-width:400px; width:100%; text-align:center">
        <h3>📍 Ingresa tu ubicación</h3>
        <p style="margin-bottom: 10px;">Necesitamos tu ubicación para poder realizar el envío</p>
        <textarea id="input-ubicacion" rows="3" placeholder="Ej. Calle, colonia, ciudad..." style="width:100%; margin:10px 0;"></textarea>
        <div style="display:flex; justify-content:space-between; gap:10px;">
          <button id="guardar-ubicacion" style="padding: 8px 16px; background: #4CAF50; color: white; border: none; border-radius: 4px;">Guardar</button>
          <button id="cerrar-modal-ubicacion" style="padding: 8px 16px; background: #f44336; color: white; border: none; border-radius: 4px;">Cancelar</button>
        </div>
      </div>
    </div>
  `);

  // Funcionalidad del modal de ubicación
  document.getElementById("cerrar-modal-ubicacion")?.addEventListener("click", () => {
    document.getElementById("modal-ubicacion").style.display = "none";
  });



  async function validarTokenYUsuario() {
    if (!token) return renderLoginPrompt();
    try {
      const res = await fetch("/api/user-info/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Token inválido");
      const data = await res.json();
      usuarioActual = data;
      renderUserMenu(data);
      await cargarCarritoAPI();
    } catch (e) {
      localStorage.clear();
      renderLoginPrompt();
      window.location.href = "/login/";
    }
  }

  function renderLoginPrompt() {
    if (!menu) return;
    menu.innerHTML = `
      <a class="btn-identificarse" href="/login/">Identificarse</a>
      <div></div>
      <p class="texto-nuevo">¿Eres un cliente nuevo? <a href="/registro/">Empieza aquí.</a></p>
    `;
    if (carritoContainer?.style) carritoContainer.style.display = "none";
  }

  function renderUserMenu(data) {
    if (!menu) return;
    menu.innerHTML = `
      <div class="user-info">
        <h1 class="user-greeting">Hola, ${data.username}</h1>
        <p class="email">${data.email}</p>
        <a href="/configuracion_usuario/" id="btn-configuracion-usuario">
          <i class="fas fa-cog"></i> Configuración
        </a>
        <button id="btn-cerrar-sesion">
          <i class="fas fa-sign-out-alt"></i> Cerrar sesión
        </button>
      </div>
    `;
    document.getElementById("btn-cerrar-sesion")?.addEventListener("click", () => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      usuarioActual = null;
      carritoActual = null;
      renderLoginPrompt();
      window.location.href = '/login/';
    });
  }

  async function cargarCarritoAPI() {
    if (!token) return;
    try {
      const res = await fetch("/encargos/obtener-carrito/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 204) {
        carritoActual = null;
        actualizarCarritoUIAPI();
        return;
      }
      if (!res.ok) throw new Error("Error al obtener el carrito");
      carritoActual = await res.json();
      actualizarCarritoUIAPI();
    } catch (error) {
      console.error("Error al cargar el carrito:", error);
      mostrarToast("Hubo un problema al cargar el carrito.", "error");

    }
  }

  function actualizarCarritoUIAPI() {
    if (!listaCarrito || !totalPrecio) return;
    listaCarrito.innerHTML = "";

    const productos = carritoActual?.productos_encargados || [];
    if (!productos.length) {
      listaCarrito.innerHTML = "<p>Tu carrito está vacío.</p>";
      totalPrecio.textContent = "0.00";
      return;
    }

    let total = 0;
    let hayProductoSinCobrar = false;

    productos.forEach(({ producto, cantidad, precio_unitario }) => {
      const div = document.createElement("div");
      div.className = "producto-carrito";
      div.style = "display: flex; align-items: center; gap: 10px; margin-bottom: 10px;";

      const imagen = (producto.imageFurniture?.split(",")[0] || "https://via.placeholder.com/80").trim();
      const precio = parseFloat(precio_unitario);
      const precioTexto = precio > 0 ? `$${precio.toFixed(2)}` : "❌";

      if (precio <= 0) hayProductoSinCobrar = true;
      else total += precio * cantidad;

      div.innerHTML = `
        <img src="${imagen}" alt="${producto.nameFurniture}" style="width:50px; height:50px; object-fit:cover;" />
        <strong style="flex:1;">${producto.nameFurniture}</strong>
        <div style="display:flex; align-items:center; gap:5px;">
          <button class="btn-disminuir" data-producto-id="${producto.id}">-</button>
          <span class="cantidad-valor">${cantidad}</span>
          <button class="btn-aumentar" data-producto-id="${producto.id}">+</button>
        </div>
        <span>Precio: ${precioTexto}</span>
      `;
      listaCarrito.appendChild(div);
    });

    totalPrecio.textContent = hayProductoSinCobrar ? "⚠️ Hay muebles sin cobrar" : `$${total.toFixed(2)}`;
    totalPrecio.style.color = hayProductoSinCobrar ? "red" : "black";

    listaCarrito.querySelectorAll(".btn-aumentar").forEach(btn =>
      btn.addEventListener("click", async () => {
        const id = btn.dataset.productoId;
        const item = carritoActual.productos_encargados.find(pe => pe.producto.id == id);
        if (item) await cambiarCantidadProducto(id, item.cantidad + 1);
      })
    );

    listaCarrito.querySelectorAll(".btn-disminuir").forEach(btn =>
      btn.addEventListener("click", async () => {
        const id = btn.dataset.productoId;
        const item = carritoActual.productos_encargados.find(pe => pe.producto.id == id);
        if (!item) return;
        if (item.cantidad > 1) {
          await cambiarCantidadProducto(id, item.cantidad - 1);
        } else if (confirm("¿Eliminar este producto del carrito?")) {
          await eliminarProductoCarrito(id);
        }
      })
    );
  }

  async function cambiarCantidadProducto(productoId, nuevaCantidad) {
    if (!token || !carritoActual) return;
    try {
      const res = await fetch(`/encargos/actualizar-cantidad/${carritoActual.id}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ producto_id: productoId, cantidad: nuevaCantidad })
      });

      if (!res.ok) {
        const data = await res.json();
        mostrarToast("❌ Error al actualizar cantidad: " + (data.detail || JSON.stringify(data)), "error");
        return;
      }

      carritoActual = await res.json();
      actualizarCarritoUIAPI();
    } catch (error) {
      mostrarToast("Error inesperado al actualizar cantidad.", "error");
    }
  }

  async function eliminarProductoCarrito(productoId) {
    await cambiarCantidadProducto(productoId, 0);
  }

  btnVaciar?.addEventListener("click", async () => {
    if (!carritoActual?.productos_encargados?.length) return;
    if (!confirm("¿Vaciar todo el carrito?")) return;
    try {
      await Promise.all(carritoActual.productos_encargados.map(pe =>
        eliminarProductoCarrito(pe.producto.id)
      ));
      mostrarToast("🧺 Carrito vaciado.", "success");
    } catch {
      mostrarToast("Error al vaciar el carrito.", "error");
    }
  });

  btnCerrar?.addEventListener("click", () => {
    if (carritoContainer?.style) carritoContainer.style.display = "none";
  });

  document.getElementById("guardar-ubicacion")?.addEventListener("click", async () => {
    const input = document.getElementById("input-ubicacion").value.trim();
    if (!input) return alert("Debes ingresar una ubicación.");

    console.log("📍 Ubicación enviada:", input);

    try {
      const res = await fetch("/api/actualizar-ubicacion/", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ ubicacionUser: input })
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.detail || JSON.stringify(error));
      }

      // Refrescar los datos del usuario para obtener la ubicación actualizada
      const resUser = await fetch("/api/user-info/", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!resUser.ok) throw new Error("Error al refrescar datos del usuario");

      usuarioActual = await resUser.json();

      // Ocultar el modal de ubicación
      document.getElementById("modal-ubicacion").style.display = "none";

      // Si hay productos en el carrito, procesar el encargo
      if (carritoActual?.productos_encargados?.length) {
        await procesarEncargo();
      }
    } catch (error) {
      console.error("Error:", error);
      mostrarToast(`No se pudo guardar la ubicación: ${error.message}`, "error");
    }
  });




  async function procesarEncargo() {
    const token = localStorage.getItem("accessToken");
    if (!token || !carritoActual?.id) {
      mostrarToast("No hay pedido activo para procesar.", "error");
      return;
    }

    // Refrescar los datos del usuario
    const resUser = await fetch("/api/user-info/", {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!resUser.ok) {
      mostrarToast("Error al refrescar los datos del usuario.", "error");
      return;
    }

    usuarioActual = await resUser.json();

    if (!usuarioActual.ubicacionUser || usuarioActual.ubicacionUser.trim() === "") {
      mostrarToast("Debes ingresar una ubicación válida antes de procesar el pedido.", "warning");
      return;
    }

    // Actualizar ubicación en el encargo
    const resActualizar = await fetch(`/encargos/actualizar-ubicacion/${carritoActual.id}/`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ ubicacion_entrega: usuarioActual.ubicacionUser.trim() })
    });

    if (!resActualizar.ok) {
      const error = await resActualizar.json().catch(() => ({}));
      mostrarToast("Error al actualizar ubicación: " + (error.detail || "Error desconocido"), "error");
      return;
    }
    mostrarSpinner();
    // Procesar el pedido
    try {
      const res = await fetch(`/encargos/procesar-pedido/${carritoActual.id}/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const errorData = await res.json();
        mostrarToast("Error al procesar pedido: " + (errorData.detail || "Error desconocido"), "error");
        return;
      }

      // Obtener información de contacto del footer
      let mensaje = "✅ Pedido procesado con éxito.\n\n";
      mensaje += "📦 Puedes contactarnos para verificar tu pedido, ver si tiene coste de envio y aclarar como se realizara el pago, o consultar sobre precios por mayoreo:\n\n";

      try {
        const footerRes = await fetch("/api/footer/");
        if (footerRes.ok) {
          const footerData = await footerRes.json();

          if (footerData.emails?.length) {
            mensaje += "📧 Correos:\n" + footerData.emails.map(e => `  - ${e}`).join("\n") + "\n";
          }
          if (footerData.phones?.length) {
            mensaje += "📱 Teléfonos:\n" + footerData.phones.map(p => `  - ${p}`).join("\n") + "\n";
          }
          if (footerData.locations?.length) {
            mensaje += "📍 Direcciones:\n" + footerData.locations.map(l => `  - ${l}`).join("\n") + "\n";
          }
        }
      } catch (error) {
        console.warn("No se pudo cargar información del footer:", error);
      }

      alert(mensaje);
      carritoActual = null;
      actualizarCarritoUIAPI();
      window.location.href = "/configuracion_usuario/#mis-encargos";
    } catch (error) {
      mostrarToast("Error inesperado al procesar pedido.", "error");
    }
  }

  btnEncargar?.addEventListener("click", async () => {
    if (!usuarioActual || !carritoActual?.productos_encargados?.length) {
      mostrarToast("No puedes encargar sin productos.", "error");

      return;
    }

    if (!usuarioActual || !carritoActual?.productos_encargados?.length) {
      mostrarToast("No puedes encargar sin productos.", "error");
      return;
    }

    const ubicacion = usuarioActual.ubicacionUser;
    const mostrarModal = !ubicacion || (typeof ubicacion === "string" && ubicacion.trim() === "");

    if (mostrarModal) {
      document.getElementById("modal-ubicacion").style.display = "flex";
      return;
    }

    await procesarEncargo();
  });

  document.getElementById("agregar-carrito-detalle")?.addEventListener("click", () => {
    if (!window.producto?.id) {
      mostrarToast("Producto no cargado aún.", "warning");
      return;
    }
    agregarAlCarritoAPI(window.producto, 1);
  });

  async function agregarAlCarritoAPI(producto, cantidad) {
    if (!token) return;

    const precio = parseFloat(producto.precioOferta) > 0
      ? parseFloat(producto.precioOferta)
      : parseFloat(producto.precio);

    try {
      if (!carritoActual?.id) {
        //Verificar que el usuario tenga una ubicación válida
        const ubicacion = usuarioActual?.ubicacionUser?.trim();

        // Construir el body solo si hay ubicación
        const bodyData = {
          ubicacion_entrega: ubicacion,
          productos: []
        };

        const res = await fetch("/encargos/crear/", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(bodyData)
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.detail || "No se pudo crear el carrito");
        }

        carritoActual = await res.json();

        if (!carritoActual?.id) {
          const resCarrito = await fetch("/encargos/obtener-carrito/", {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!resCarrito.ok) throw new Error("No se pudo obtener el carrito creado");
          carritoActual = await resCarrito.json();
        }
      }

      const resAgregar = await fetch(`/encargos/agregar/${carritoActual.id}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          producto_id: producto.id,
          cantidad,
          precio_unitario: precio
        })
      });

      if (!resAgregar.ok) {
        const err = await resAgregar.json();
        throw new Error(err.detail || JSON.stringify(err));
      }

      carritoActual = await resAgregar.json();
      actualizarCarritoUIAPI();
    } catch (error) {
      console.error("Error al agregar al carrito:", error);
      mostrarToast("Ocurrió un error al agregar el producto.", "error");
    }
  }
  validarTokenYUsuario();
});


document.addEventListener("DOMContentLoaded", function () {
  const hash = window.location.hash;

  if (hash === "#mi-perfil") {
    if (typeof mostrarSeccion === "function") {
      mostrarSeccion("mi-perfil");
    }
  }
});
