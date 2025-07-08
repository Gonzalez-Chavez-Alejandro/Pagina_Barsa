let usuarioActual = null;
let usernameOriginal = null;  // <-- Aquí guardamos username para enviar luego

// Carga datos del usuario desde la API y guarda en usuarioActual
async function cargarUsuarioActual() {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    window.location.href = '/login';
    return;
  }

  try {
    const res = await fetch(`/api/user-info/?t=${Date.now()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      cache: 'no-store'
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const data = await res.json();
    usernameOriginal = data.username;

    usuarioActual = Object.freeze({
      
      nombre: data.last_name || '',
      correo: data.email || '',
      telefono: data.phoneUser || '',
      ubicacionUser: data.ubicacionUser || '',
      ageUser: data.ageUser || null
    });

    // Limpiar caché del navegador para el campo de correo
    const correoInput = document.getElementById('correo');
    if (correoInput) {
      correoInput.value = ''; // Limpiar primero
      setTimeout(() => {
        correoInput.value = usuarioActual.correo || '';
        correoInput.dispatchEvent(new Event('change'));
      }, 100);
    }

    // Fuerza la actualización del DOM
    const ubicacionInput = document.getElementById('ubicacion');
    if (ubicacionInput) {
      ubicacionInput.value = usuarioActual.ubicacionUser || '';
      ubicacionInput.dispatchEvent(new Event('change'));
    }

  } catch (error) {
    console.error('Error:', error);
    localStorage.removeItem('accessToken');
    sessionStorage.clear();
    window.location.href = '/login?session=expired';
  }
}

async function cargarEncargosUsuario() {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    mostrarToast('No estás autenticado. Inicia sesión primero.', 'error');

    window.location.href = '/login';
    return;
  }
  mostrarSpinner();
  try {
    const res = await fetch('/encargos/mis-encargos/', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    if (!res.ok) throw new Error('Error al cargar encargos');

    const encargosUsuario = await res.json(); // <-- Falta esta línea para obtener los datos
    const contenedor = document.getElementById('lista-encargos'); // <-- Falta obtener el contenedor
    contenedor.innerHTML = '';

    const encargosFiltrados = encargosUsuario.filter(encargo => encargo.estado !== 'carrito');

    if (!Array.isArray(encargosFiltrados) || encargosFiltrados.length === 0) {
      contenedor.innerHTML = `
        <div class="encargo-card">
          <p class="messaje-no-tienes-encargos-registrados">
            <i class="fas fa-box-open"></i> No tienes encargos registrados
          </p>
        </div>`;
      return;
    }

    encargosFiltrados.forEach(encargo => {
      const tieneProductoSinPrecio = (encargo.productos_encargados || []).some(item => {
        const precio = Number(item.producto?.priceFurniture || 0);
        return precio === 0;
      });

      const totalHTML = tieneProductoSinPrecio
        ? `<div class="encargo-total" style="color: red"><strong>Total:</strong> Póngase en contacto con la empresa</div>`
        : `<div class="encargo-total">Total: $${Number(encargo.total).toFixed(2)}</div>`;

      const productosHTML = (encargo.productos_encargados || []).map(item => {
        const producto = item.producto || {};
        const imagen = item.imagen || 'https://via.placeholder.com/100';
        const nombre = producto.nameFurniture || 'Producto';
        const cantidad = Number(item.cantidad) || 0;
        const precioOriginal = Number(producto.priceFurniture) || 0;
        const porcentajeDescuento = producto.porcentajeDescuento || 0;
        const precioConDescuento = Number(producto.PrecioOferta) || precioOriginal;

        return `
          <div class="producto-encargo">
            <img src="${imagen}" alt="${nombre}" class="producto-imagen" onerror="this.src='https://via.placeholder.com/100'">
            <div>
              <p><strong>${nombre}</strong></p>
              <p>Cantidad: ${cantidad}</p>
              <p>Precio original: ${precioOriginal === 0 ? 'Póngase en contacto con la empresa' : `$${precioOriginal.toFixed(2)}`}</p>
              <p>Descuento: ${porcentajeDescuento}%</p>
              <p>Precio con descuento: $${precioConDescuento.toFixed(2)}</p>
            </div>
          </div>`;
      }).join('');

      const encargoElement = document.createElement('div');
      encargoElement.className = 'encargo-card';
      const encargoId = encargo.id.toString();
      const idDisplay = encargoId.includes('-') ? encargoId.split('-')[0] : encargoId;
      const estadoMostrar = (encargo.estado === 'procesado') ? 'procesando' : (encargo.estado || 'desconocido');
      const nombreUsuario = encargo.usuario_nombre || 'No especificado';
      const correoUsuario = encargo.usuario_correo || 'No especificado';
      const telefonoUsuario = encargo.usuario_telefono || 'No especificado';
      encargoElement.innerHTML = `
        <div class="encargo-header">
       
          <div>
            <h3 class="h3-encargo">Encargo #${idDisplay} <span class="encargo-fecha">${new Date(encargo.fecha).toLocaleDateString()}</span></h3>
              <div class="um-usuario-info">
                <div class="um-info-item" title="${nombreUsuario}">
                  <i class="fas fa-user um-fas"></i> ${nombreUsuario}
                </div>
                <div class="um-info-item" title="${correoUsuario}">
                  <i class="fas fa-envelope um-fas"></i> ${correoUsuario}
                </div>
                <div class="um-info-item" title="${telefonoUsuario}">
                  <i class="fas fa-phone um-fas"></i> ${telefonoUsuario}
                </div>
                <div class="um-info-item" title="${encargo.ubicacion_entrega || 'No especificada'}">
                  <i class="fas fa-map-marker-alt um-fas"></i> ${encargo.ubicacion_entrega || 'No especificada'}
              </div>
            </div>

            <h3>Estado:
              <p class="encargo-estado estado-${estadoMostrar.toLowerCase()}">
                <strong>${estadoMostrar.charAt(0).toUpperCase() + estadoMostrar.slice(1)}</strong>
              </p>
             
            </h3>
          </div>
          
        </div>

        <div class="encargo-productos">${productosHTML}</div>

        

        ${totalHTML}

        <div class="encargo-acciones">
          <button class="btn-pdf" data-encargo='${encodeURIComponent(JSON.stringify(encargo))}'>
            <i class="fas fa-file-pdf"></i> PDF
          </button>
          <button class="btn-cancelar" data-encargo-id="${encargo.id}">
            <i class="fas fa-times-circle"></i> Cancelar pedido
          </button>
        </div>`;

      contenedor.appendChild(encargoElement);
    });

  } catch (error) {
    console.error(error);
    mostrarToast('Error al cargar los encargos del usuario.', 'error');
  } finally {
    ocultarSpinner();
  }
}

// Escucha eventos para generar PDF y eliminar encargos
// Evento global para delegar acciones
document.addEventListener('click', async (e) => {
  const btnPDF = e.target.closest('.btn-pdf');
  const btnCancelar = e.target.closest('.btn-cancelar');

  // Generar PDF
  if (btnPDF) {
    const encargo = JSON.parse(decodeURIComponent(btnPDF.dataset.encargo));
    generarPDF(encargo);
    return;
  }

  // Cancelar pedido
  if (btnCancelar) {
    const id = btnCancelar.getAttribute('data-encargo-id');
    if (!confirm('¿Estás seguro de que quieres cancelar este pedido?')) return;

    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/encargos/${id}/cambiar-estado/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ estado: 'cancelado' })
      });

      if (!res.ok) throw new Error('Error al cancelar el pedido');
      mostrarToast('Pedido cancelado correctamente', 'success');
      cargarEncargosUsuario();  // recargar lista
    } catch (err) {
      console.error(err);
      mostrarToast('Hubo un error al cancelar el pedido.', 'error');
    }
  }
});


async function generarPDF(encargo) {
  console.log('usuarioActual:', usuarioActual);

  // Obtener datos del footer desde la API
  let footerData = null;
  try {
    const response = await fetch('/api/footer/');
    if (response.ok) {
      footerData = await response.json();
    }
  } catch (error) {
    console.error('Error al obtener datos del footer:', error);
  }

  const doc = new window.jspdf.jsPDF();
  const lineHeight = 7;
  const pageHeight = doc.internal.pageSize.height;
  const config = {
    logoUrl: 'https://res.cloudinary.com/dacrpsl5p/image/upload/v1745430695/Logo-Negro_nfvywi.png',
    logoConfig: { x: 15, y: 12, width: 40, height: 15 },
    margins: { left: 45, right: 15, top: 50, bottom: 30 },
    colors: {
      primary: '#000000',
      secondary: '#4a5568',
      accent: '#4a5568',
      clientData: '#000000',  // Color para datos del cliente
      companyContact: '#000000' // Color para contacto de la empresa
    },
    companyName: "Distribuidora mueblera sahuayense Barsa muebles",
    pageWidth: 210
  };

  // Encabezado con logo y nombre de la empresa
  doc.addImage(config.logoUrl, 'PNG', config.logoConfig.x, config.logoConfig.y, config.logoConfig.width, config.logoConfig.height);
  doc.setFontSize(10).setTextColor(config.colors.secondary);
  doc.text(config.companyName, config.logoConfig.x + 50, config.logoConfig.y + 5);

  let y = config.logoConfig.y + config.logoConfig.height + 10;

  // Sección de Información del Cliente
  doc.setFontSize(15).setTextColor(config.colors.primary).setFont("helvetica", "bold");
  doc.text("INFORMACIÓN DEL CLIENTE", config.margins.left, y);
  y += 7;

  doc.setFont("helvetica", "normal").setFontSize(10);
  // Nombre del cliente
  doc.setTextColor(config.colors.clientData);
  doc.setFont("helvetica", "bold");
  doc.text(`Nombre: ${usuarioActual?.nombre || 'No especificado'}`, config.margins.left, y);
  y += 7;

  // Correo del cliente (destacado)
  doc.setFont("helvetica", "bold");
  doc.text("Correo: ", config.margins.left, y);
  doc.setFont("helvetica", "normal").setTextColor('#1a365d');
  doc.text(usuarioActual?.correo || 'No especificado', config.margins.left + doc.getTextWidth("Correo: "), y);
  y += 7;

  // Teléfono del cliente
  doc.setFont("helvetica", "bold");
  doc.text(`Teléfono: ${usuarioActual?.telefono || 'No especificado'}`, config.margins.left, y);
  y += 7;
  doc.setFont("helvetica", "bold");
  doc.text("Ubicación de entrega:", config.margins.left, y);
  doc.setFont("helvetica", "normal");
  doc.text(encargo.ubicacion_entrega || 'No especificada', config.margins.left + doc.getTextWidth("Ubicación de entrega: ") + 1, y);
  y += 15;


  // Detalles del encargo
  doc.setFontSize(18).setTextColor(config.colors.primary).setFont("helvetica", "bold");
  doc.text(`ENCARGO #${encargo.id}`, config.margins.left, y);
  y += 10;

  doc.setFontSize(12).setFont("helvetica", "normal");
  doc.text(`Fecha: ${new Date(encargo.fecha).toLocaleDateString()}`, config.margins.left, y);
  y += 10;

  // Tabla de productos
  doc.setFillColor(config.colors.accent);
  doc.rect(config.margins.left - 1, y, config.pageWidth - config.margins.left - config.margins.right + 10, 8, 'F');
  doc.setTextColor(255).setFontSize(12);
  doc.text('Producto', config.margins.left, y + 6);
  doc.text('Cantidad', 90, y + 6);
  doc.text('Precio original', 125, y + 6);
  doc.text('Precio con descuento', 160, y + 6);

  y += 12;
  doc.setFontSize(10).setTextColor(config.colors.primary);

  let tieneProductoConPrecioCero = false;

  (encargo.productos_encargados || []).forEach(item => {
    const nombre = (item.producto && item.producto.nameFurniture) || 'Producto';
    const cantidad = Number(item.cantidad) || 0;
    const precioOriginal = Number(item.producto?.priceFurniture) || 0;
    const precioConDescuento = Number(item.producto?.PrecioOferta) || 0;

    if (precioOriginal === 0) {
      tieneProductoConPrecioCero = true;
    }

    const textoPrecioOriginal = precioOriginal === 0 ? "No definido" : `$${precioOriginal.toFixed(2)}`;
    const textoPrecioConDescuento = precioConDescuento === 0 ? "No definido" : `$${precioConDescuento.toFixed(2)}`;

    const productLines = doc.splitTextToSize(nombre, 60);
    const productHeight = productLines.length * lineHeight;

    doc.text(productLines, config.margins.left, y);
    doc.text(cantidad.toString(), 90, y);
    doc.text(textoPrecioOriginal, 125, y);
    doc.text(textoPrecioConDescuento, 170, y);

    y += Math.max(productHeight, 8);

    if (y > pageHeight - 30) {
      doc.addPage();
      y = config.margins.top;
    }
  });

  // Total del encargo
  y += 10;
  doc.setFont("helvetica", "bold").setFontSize(12);

  if (tieneProductoConPrecioCero) {
    doc.setTextColor('#ff0000');
    doc.text("Total: Póngase en contacto con la empresa para aclarar el precio.", config.margins.left, y);
  } else {
    doc.setTextColor(config.colors.primary);
    doc.text(`Total: $${Number(encargo.total).toFixed(2)}`, 150, y);
  }

  // FOOTER - INFORMACIÓN DE CONTACTO DE LA EMPRESA
  y += 20; // Espacio antes del footer

  // Línea separadora
  doc.setDrawColor(200);
  doc.line(config.margins.left, y, config.pageWidth - config.margins.right, y);
  y += 10;

  // Título "CONTACTO DE LA EMPRESA"
  doc.setFontSize(10).setTextColor(config.colors.companyContact).setFont("helvetica", "bold");
  doc.text("CONTACTO DE LA EMPRESA", config.margins.left, y);
  y += 7;

  // Información de contacto de la empresa
  doc.setFontSize(10).setTextColor(config.colors.companyContact).setFont("helvetica", "normal");

  if (footerData) {
    // Filtrar el correo del cliente si aparece en los datos del footer
    const companyEmails = footerData.emails ?
      footerData.emails.filter(email => email !== usuarioActual?.correo) : [];

    // Mostrar emails de la empresa con manejo de texto multilínea
    if (companyEmails.length > 0) {
      const emailText = `Email: ${companyEmails.join(' | ')}`;
      const emailLines = doc.splitTextToSize(emailText, config.pageWidth - config.margins.left - config.margins.right);
      emailLines.forEach(line => {
        if (y > pageHeight - 15) { // Verificar espacio para el footer
          doc.addPage();
          y = config.margins.top;
        }
        doc.text(line, config.margins.left, y);
        y += 5;
      });
    }

    // Mostrar teléfonos de la empresa con manejo de texto multilínea
    if (footerData.phones && footerData.phones.length > 0) {
      const phoneText = `Teléfono: ${footerData.phones.join(' | ')}`;
      const phoneLines = doc.splitTextToSize(phoneText, config.pageWidth - config.margins.left - config.margins.right);
      phoneLines.forEach(line => {
        if (y > pageHeight - 15) {
          doc.addPage();
          y = config.margins.top;
        }
        doc.text(line, config.margins.left, y);
        y += 5;
      });
    }

    // Mostrar ubicaciones de la empresa con manejo de texto multilínea
    if (footerData.locations && footerData.locations.length > 0) {
      const locationText = `Ubicación: ${footerData.locations.join(' | ')}`;
      const locationLines = doc.splitTextToSize(locationText, config.pageWidth - config.margins.left - config.margins.right);
      locationLines.forEach(line => {
        if (y > pageHeight - 15) {
          doc.addPage();
          y = config.margins.top;
        }
        doc.text(line, config.margins.left, y);
        y += 5;
      });
    }
  } else {
    // Datos por defecto con manejo de texto multilínea
    const defaultEmail = 'Email: barsa@gmail.com';
    const defaultPhone = 'Teléfono: +52 000 111 5522';
    const defaultLocation = 'Ubicación: Carretera Sahuayo La Barca KM 5.4 | Juárez #100 Sahuayo Mich | Circunvalación #Jiquilpa';

    [defaultEmail, defaultPhone, defaultLocation].forEach(text => {
      const lines = doc.splitTextToSize(text, config.pageWidth - config.margins.left - config.margins.right);
      lines.forEach(line => {
        if (y > pageHeight - 15) {
          doc.addPage();
          y = config.margins.top;
        }
        doc.text(line, config.margins.left, y);
        y += 5;
      });
    });
  }

  doc.save(`encargo-${encargo.id}.pdf`);
}









document.addEventListener('DOMContentLoaded', async () => {
  await cargarUsuarioActual();
  await cargarEncargosUsuario();
  rellenarFormularioUsuario();
  console.log("Ubicación cargada:", usuarioActual.ubicacionUser);

  function rellenarFormularioUsuario() {
    console.log("Datos al rellenar formulario:", usuarioActual); // Verifica aquí
    const campos = {
      nombre: "nombre",
      telefono: "telefono",
      correo: "correo",
      ubicacionUser: "ubicacion"
    };

    for (const [clave, id] of Object.entries(campos)) {
      const input = document.getElementById(id);
      if (input && usuarioActual[clave] !== undefined) {
        console.log(`Asignando ${clave}:`, usuarioActual[clave]); // Depuración
        input.value = usuarioActual[clave];
      }
    }
  }
});

const formulario = document.getElementById('form-configuracion');
formulario.addEventListener('submit', async (e) => {
  e.preventDefault();

  limpiarErrores();

  const nombreInput = document.getElementById('nombre');
  const telefonoInput = document.getElementById('telefono');
  const correoInput = document.getElementById('correo');
  const ubicacionInput = document.getElementById('ubicacion');
  const passvalidate = document.getElementById('validate').value.trim();
  const nuevaPassword = document.getElementById('contrasena').value.trim();

  // Validaciones
  if (!nombreInput.value.trim()) {
    mostrarErrorToast("Por favor ingresa tu nombre completo.");
    mostrarErrorEnSpan('error-nombre', "Por favor ingresa tu nombre completo.");
    nombreInput.focus();
    return;
  }

  if (!telefonoInput.value.trim()) {
    mostrarErrorToast("Por favor ingresa tu teléfono.");
    mostrarErrorEnSpan('error-telefono', "Por favor ingresa tu teléfono.");
    telefonoInput.focus();
    return;
  }


  if (!correoInput.value.trim()) {
    mostrarErrorToast("Por favor ingresa tu correo electrónico.");
    mostrarErrorEnSpan('error-correo', "Por favor ingresa tu correo electrónico.");
    correoInput.focus();
    return;
  }

  if (!ubicacionInput.value.trim()) {
    mostrarErrorToast("Por favor ingresa tu ubicación.");
    mostrarErrorEnSpan('error-ubicacion', "Por favor ingresa tu ubicación.");
    ubicacionInput.focus();
    return;
  }

  const validado = await verificarPassword(passvalidate);
  if (!validado) {
    mostrarErrorToast("La contraseña actual es incorrecta.");
    mostrarErrorToast("No se guardaron los cambios.");
    return;
  }

  const token = localStorage.getItem("access_token");

  try {
    // Obtener información del usuario
    const responseUserInfo = await fetch('/api/user-info/', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!responseUserInfo.ok) throw new Error("No se pudo obtener la información del usuario.");
    const usuario = await responseUserInfo.json();

    const datosUsuario = {
      username: usuario.username.replace(/\s+/g, '_'),


      last_name: nombreInput.value.trim(),
      
      phoneUser: telefonoInput.value.trim(),
      email: correoInput.value.trim(),
      ageUser: usuario.ageUser, // corregido usuarioActual -> usuario
    };
    if (nuevaPassword) datosUsuario.password = nuevaPassword;

    // Actualizar datos del usuario
    const resActualizarUsuario = await fetch(`/api/users/${usuario.id}/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(datosUsuario)
    });

    if (!resActualizarUsuario.ok) {
      const errorData = await resActualizarUsuario.json();
      throw new Error("Error al guardar usuario: " + JSON.stringify(errorData));
    }

    // Actualizar ubicación
    const resActualizarUbicacion = await fetch('/api/actualizar-ubicacion/', {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ ubicacionUser: ubicacionInput.value.trim() })
    });

    if (!resActualizarUbicacion.ok) {
      const errorUbicacion = await resActualizarUbicacion.json();
      throw new Error("Error al guardar ubicación: " + JSON.stringify(errorUbicacion));
    }

    alert("¡Cambios guardados correctamente!");
  } catch (error) {
    console.error("Error al guardar configuración:", error);

    let mensaje = "Ocurrió un error al guardar los cambios.";
    try {
      const errorData = JSON.parse(error.message.replace(/Error al guardar.*?:\s*/, ""));
      
      if (errorData.email) {
        mensaje = "Error en email: " + errorData.email.join(", ");
        mostrarErrorEnSpan('error-correo', mensaje);
      }
      if (errorData.ubicacion) {
        mensaje = "Error en ubicación: " + errorData.ubicacion.join(", ");
        mostrarErrorEnSpan('error-ubicacion', mensaje);
      }
    } catch {
      // No se pudo interpretar el error como JSON
    }
    mostrarErrorToast(mensaje);
  }
});


function mostrarErrorEnSpan(idSpan, mensaje) {
  const span = document.getElementById(idSpan);
  if (span) {
    span.textContent = mensaje;
    span.style.display = 'block';
  }
}

function limpiarErrores() {
  ['error-nombre', 'error-telefono', 'error-correo', 'error-ubicacion'].forEach(id => {
    const span = document.getElementById(id);
    if (span) {
      span.textContent = '';
      span.style.display = 'none';
    }
  });
}

async function verificarPassword(password) {
  const token = localStorage.getItem('access_token');
  try {
    const res = await fetch('/api/verificar-password/', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ password })
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.valid === true;
  } catch (error) {
    console.error("Error al verificar la contraseña:", error);
    return false;
  }
}

// Función para mostrar un toast de error
function mostrarErrorToast(mensaje, duracion = 10000) {
  const contenedorId = 'notificaciones';
  let contenedor = document.getElementById(contenedorId);
  if (!contenedor) {
    contenedor = document.createElement('div');
    contenedor.id = contenedorId;
    contenedor.style.position = 'fixed';
    contenedor.style.top = '20px';
    contenedor.style.left = '20px';
    contenedor.style.zIndex = '9999';
    contenedor.style.display = 'flex';
    contenedor.style.flexDirection = 'column';
    contenedor.style.gap = '10px';
    contenedor.style.maxWidth = '300px';
    document.body.appendChild(contenedor);
  }
  const toast = document.createElement('div');
  toast.textContent = mensaje;
  toast.style.backgroundColor = '#f44336';
  toast.style.color = 'white';
  toast.style.padding = '12px 20px';
  toast.style.borderRadius = '5px';
  toast.style.boxShadow = '0 3px 6px rgba(0,0,0,0.2)';
  toast.style.fontWeight = 'bold';
  toast.style.cursor = 'pointer';
  toast.style.animation = 'slideInLeft 0.3s ease forwards';
  toast.addEventListener('click', () => {
    if (contenedor.contains(toast)) contenedor.removeChild(toast);
  });
  contenedor.appendChild(toast);
  setTimeout(() => {
    if (contenedor.contains(toast)) contenedor.removeChild(toast);
  }, duracion);
}

const style = document.createElement('style');
style.textContent = `
@keyframes slideInLeft {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
`;
document.head.appendChild(style);
