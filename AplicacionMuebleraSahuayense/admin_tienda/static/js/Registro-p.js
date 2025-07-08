document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('registro-form');
  const inputEdad = document.getElementById('edad');

  inputEdad.addEventListener('keydown', function (e) {
    if (
      e.key === 'Backspace' ||
      e.key === 'Tab' ||
      e.key === 'ArrowLeft' ||
      e.key === 'ArrowRight' ||
      e.key === 'Delete'
    ) {
      return;
    }
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  });

  inputEdad.addEventListener('input', function () {
    // Eliminar caracteres no numéricos
    this.value = this.value.replace(/[^0-9]/g, '');

    // Validar rango de 1 a 100
    let val = parseInt(this.value, 10);
    if (!isNaN(val)) {
      if (val < 1) {
        this.value = '1';
      } else if (val > 100) {
        this.value = '100';
      }
    }
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Recolectar campos
    const firstName = document.getElementById('nombre').value.trim();
    const edad = parseInt(document.getElementById('edad').value.trim());
    const email = document.getElementById('correo').value.trim();
    const password = document.getElementById('contrasena').value;
    const confirmPassword = document.getElementById('confirmar_contrasena').value;
    const phoneUser = document.getElementById('telefono').value.trim();
    const terminos = document.getElementById('terminos').checked;

    // Validaciones
    if (!terminos) {
      alert('Debes aceptar los términos y condiciones.');
      ocultarSpinner();
      return;
    }

    if (password !== confirmPassword) {
      document.getElementById('confirmar-error').style.display = 'block';
      ocultarSpinner();
      return;
    } else {
      document.getElementById('confirmar-error').style.display = 'none';
    }

    if (password.length < 8) {
      document.getElementById('contrasena-error').style.display = 'block';
      ocultarSpinner();
      return;
    } else {
      document.getElementById('contrasena-error').style.display = 'none';
    }

    if (isNaN(edad) || edad < 1 || edad > 120) {
      document.getElementById('edad-error').style.display = 'block';
      ocultarSpinner();
      return;
    } else {
      document.getElementById('edad-error').style.display = 'none';
    }

    // Preparar datos para API
    const last_name = firstName;
    // <--- CAMBIO AQUÍ
    const payload = {
      last_name: last_name,
      email: email,
      password: password,
      phoneUser: phoneUser,
      ageUser: edad
    };

    ['nombre-error', 'correo-error', 'edad-error', 'contrasena-error', 'confirmar-error'].forEach(id => {
      document.getElementById(id).style.display = 'none';
      document.getElementById(id).textContent = '';
    });
    mostrarSpinner();
    // Registrar usuario
    fetch('/api/register/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken')
      },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(err => { throw err; });
        }
        return res.json();
      })
      .then(data => {
  // Ya sabes el username porque usaste last_name en create_user como username
  const username = firstName.trim(); // O si en backend haces strip o reemplazo de espacios, hazlo igual aquí
  return fetch('/api/login/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: username,
      password: password
    })
  });
})

      .then(res => {
        if (!res.ok) {
          return res.json().then(err => { throw err; });
        }
        return res.json();
      })
      .then(authData => {
        localStorage.setItem('accessToken', authData.access);
        localStorage.setItem('refreshToken', authData.refresh);
        alert('Registro e inicio de sesión exitoso');
        window.location.href = '/';
      })
      .catch(err => {
        // Mostrar error de nombre
        if (err.username) {
          let mensaje = err.username[0];
          if (mensaje === "A user with that username already exists.") {
            mensaje = "Este nombre de usuario ya está en uso.";
          }
          mostrarToast(mensaje, "error");
          document.getElementById('nombre-error').textContent = mensaje;
          document.getElementById('nombre-error').style.display = 'block';
        }


        // Mostrar error de correo
        if (err.email) {
          let mensaje = "";  // inicializa el mensaje
          if (typeof err.email === 'string') {
            mensaje = err.email;
          } else if (typeof err.email === 'object') {
            // Combina todos los mensajes del objeto (como duplicado, formato, etc.)
            mensaje = Object.values(err.email).join(' ');
          }
          document.getElementById('correo-error').textContent = mensaje;
          document.getElementById('correo-error').style.display = 'block';
        }


        if (err.phoneUser) {
          alert(err.phoneUser[0]);
        }

        if (err.password) {
          document.getElementById('contrasena-error').textContent = err.password[0];
          document.getElementById('contrasena-error').style.display = 'block';
        }

        console.error('Error:', err);
      }).finally(() => {
        // Siempre oculta el spinner, sin importar éxito o error
        ocultarSpinner();
      });

  });

  // Obtener token CSRF para Django
  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }
});
