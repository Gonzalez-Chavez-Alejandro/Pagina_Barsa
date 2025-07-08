const DEFAULTS = {
  facebook: "",
  whatsapp: "",
  instagram: "",
  email: ""
};

/*const DEFAULTS = {
  facebook: "https://www.facebook.com/share/18dEbL8gtP/",
  whatsapp: "",
  instagram: "https://www.instagram.com/barsa_muebles/",
  email: "mailto:barsamuebles@gmail.com"
};*/

const token = localStorage.getItem('accessToken');
if (!token) {
  mostrarToast("No estás autenticado. Inicia sesión primero.", "error");
  window.location.href = "/login";  // O redirige donde corresponda
}

// Correos dinámicos
function addEmailField(value = "") {
  const container = document.getElementById('emails-container');
  const div = document.createElement('div');
  div.className = 'input-row';
  div.innerHTML = `
    <input type="email" class="form-input email-input" value="${value}" placeholder="correo@empresa.com" >
    <button class="icon-btn danger" onclick="removeEmailField(this)">
      <i class="fas fa-trash"></i>
    </button>
  `;
  container.appendChild(div);
}

function removeEmailField(btn) {
  btn.closest('.input-row').remove();
}

// Teléfonos
function addPhoneField(value = "") {
  const container = document.getElementById('phones-container');
  const div = document.createElement('div');
  div.className = 'input-row';
  div.innerHTML = `
    <input type="text" class="form-input phone-input" value="${value}" placeholder="+52 000 000 0000">
    <button class="icon-btn danger" onclick="removePhoneField(this)">
      <i class="fas fa-trash"></i>
    </button>
  `;
  container.appendChild(div);
}

function removePhoneField(btn) {
  btn.closest('.input-row').remove();
}

// Ubicaciones
function addLocationField(value = "") {
  const container = document.getElementById('locations-container');
  const div = document.createElement('div');
  div.className = 'input-row';
  div.innerHTML = `
    <textarea class="form-input location-input" placeholder="Av. Principal #123, Ciudad">${value}</textarea>
    <button class="icon-btn danger" onclick="removeLocationField(this)">
      <i class="fas fa-trash"></i>
    </button>
  `;
  container.appendChild(div);
}

function removeLocationField(btn) {
  btn.closest('.input-row').remove();
}

// Cargar datos del footer
async function cargarFooter() {
  mostrarSpinner();
  try {
    const res = await fetch('/api/footer/', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    mostrarSpinner();
    if (!res.ok) throw new Error('No se pudo cargar el footer');
    const data = await res.json();

    // Correos
    const emailsContainer = document.getElementById('emails-container');
    emailsContainer.innerHTML = '';
    if (data.emails && data.emails.length > 0) {
      data.emails.forEach(email => addEmailField(email));
    } else {
      addEmailField('');  // Al menos un input vacío
    }

    // Teléfonos
    const phonesContainer = document.getElementById('phones-container');
    phonesContainer.innerHTML = '';
    (data.phones || []).forEach(phone => addPhoneField(phone));

    // Ubicaciones
    const locationsContainer = document.getElementById('locations-container');
    locationsContainer.innerHTML = '';
    (data.locations || []).forEach(loc => addLocationField(loc));

    // Redes sociales
    document.getElementById('facebook').value = data.socials?.facebook || DEFAULTS.facebook;
    document.getElementById('whatsapp').value = data.socials?.whatsapp || DEFAULTS.whatsapp;
    document.getElementById('instagram').value = data.socials?.instagram || DEFAULTS.instagram;
    document.getElementById('envelope').value = data.socials?.email || DEFAULTS.email;

  } catch (err) {
    console.warn("Footer no cargado:", err);
    mostrarToast("Error al cargar el footer", "error");
  }finally {
    ocultarSpinner();
  }
}

// Guardar datos del footer
async function guardarFooter() {
  mostrarSpinner();
  const facebookValue = document.getElementById('facebook').value.trim() || DEFAULTS.facebook;
  const whatsappValue = document.getElementById('whatsapp').value.trim() || DEFAULTS.whatsapp;
  const instagramValue = document.getElementById('instagram').value.trim() || DEFAULTS.instagram;
  const emailSocialValue = document.getElementById('envelope').value.trim() || DEFAULTS.email;

  const footerData = {
    emails: Array.from(document.querySelectorAll('.email-input'))
                  .map(input => input.value.trim())
                  .filter(v => v !== ''),
    phones: Array.from(document.querySelectorAll('.phone-input'))
                  .map(input => input.value.trim())
                  .filter(v => v !== ''),
    locations: Array.from(document.querySelectorAll('.location-input'))
                    .map(textarea => textarea.value.trim())
                    .filter(v => v !== ''),
    socials: {
      facebook: facebookValue,
      whatsapp: whatsappValue,
      instagram: instagramValue,
      email: emailSocialValue
    }
  };

  try {
    mostrarSpinner();
    const res = await fetch('/api/footer/', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(footerData)
    });

    if (res.ok) {
      mostrarToast('Configuración guardada exitosamente.', "success");
    } else {
      const errorData = await res.json();
      mostrarToast('Error al guardar footer: ' + JSON.stringify(errorData, null, 2), "error");
    }
  } catch (err) {
    console.error('Error al guardar footer:', err);
    mostrarToast('Error de red al guardar configuración.', "error");
  }finally {
    ocultarSpinner();
  }
}

window.onload = cargarFooter;
