  function actualizarVistaContactoDesdeStorage() {
    const data = JSON.parse(localStorage.getItem('footerData'));
    if (!data) return;

    // Teléfonos
    const phoneList = document.getElementById('lista-telefonos-contactanos');
    phoneList.innerHTML = '';
    data.phones.forEach(phone => {
      const li = document.createElement('li');
      li.textContent = phone;
      phoneList.appendChild(li);
    });

    // Ubicaciones
    const locationList = document.getElementById('lista-ubicaciones-contactanos');
    locationList.innerHTML = '';
    data.locations.forEach(loc => {
      const li = document.createElement('li');
      li.textContent = loc;
      locationList.appendChild(li);
    });

    // Redes sociales
    const socialContainer = document.getElementById('lista-redes-contactanos');
    socialContainer.innerHTML = `
  <a href="${data.socials.facebook}" target="_blank" class="social-icon facebook"><i class="fab fa-facebook"></i></a>
  <a href="${data.socials.whatsapp}" target="_blank" class="social-icon whatsapp"><i class="fab fa-whatsapp"></i></a>
  <a href="${data.socials.instagram}" target="_blank" class="social-icon instagram"><i class="fab fa-instagram"></i></a>
  <a href="${data.socials.email}" target="_blank" class="social-icon gmail"><i class="fas fa-envelope"></i></a>
`;

  }

  // Llamar al cargar la vista pública
  window.onload = actualizarVistaContactoDesdeStorage;