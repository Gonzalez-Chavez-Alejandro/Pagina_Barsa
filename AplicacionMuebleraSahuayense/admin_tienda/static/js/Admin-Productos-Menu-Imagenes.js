// Esperar que el DOM esté cargado
document.addEventListener("DOMContentLoaded", () => {
  const linkSubir = document.getElementById('linkSubir-img');
  const linkOtro = document.getElementById('linkOtro-img');
  const sectionSubir = document.getElementById('subir');
  const sectionOtro = document.getElementById('otro');

  linkSubir.addEventListener('click', () => {
    sectionSubir.classList.add('active');
    sectionOtro.classList.remove('active');
    linkSubir.classList.add('active');
    linkOtro.classList.remove('active');
  });

  linkOtro.addEventListener('click', () => {
    sectionSubir.classList.remove('active');
    sectionOtro.classList.add('active');
    linkOtro.classList.add('active');
    linkSubir.classList.remove('active');
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const mensajeElemento = document.getElementById("nombreArchivoImagen");

  async function obtenerFirmaYTimestamp(publicId) {
    try {
      const response = await fetch('/generate_signature?public_id=' + encodeURIComponent(publicId));
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al obtener la firma y timestamp:', error);
    }
  }

  async function subirImagen() {
    const imageInput = document.getElementById('imageInput');
    const file = imageInput.files[0];

    if (!file) {
      mensajeElemento.style.display = "inline"; // 👈 mostrar el span
      mensajeElemento.style.color = "red";
      mensajeElemento.textContent = "No se seleccionó ningún archivo";
      return;
    }

    const folderInput = document.getElementById('nombre-carpeta');
    if (!folderInput || !folderInput.value.trim()) {
      mensajeElemento.style.display = "inline"; // 👈 mostrar el span
      mensajeElemento.style.color = "red";
      mensajeElemento.textContent = "Por favor, ingresa un nombre de carpeta";
      return;
    }

    const folderName = folderInput.value.trim();
    const publicId = folderName + '/' + file.name.split('.')[0];

    const { signature, timestamp } = await obtenerFirmaYTimestamp(publicId);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "formulario");
    formData.append("signature", signature);
    formData.append("timestamp", timestamp);
    formData.append("api_key", "793629269656468");
    formData.append("public_id", publicId);

    mensajeElemento.style.display = "inline"; // 👈 mostrar el span
    mensajeElemento.style.color = "black";
    mensajeElemento.textContent = "Subiendo imagen...";
    mostrarSpinner();
    try {
      const response = await fetch("https://api.cloudinary.com/v1_1/dacrpsl5p/image/upload", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (data.secure_url) {
        localStorage.setItem("imagenProducto", data.secure_url);
        mensajeElemento.style.display = "inline";
        mensajeElemento.style.color = "green";
        mensajeElemento.textContent = "Imagen subida con éxito: " + file.name;
        mostrarToast("Imagen subida con éxito: " + file.name, "success");

        // ✅ Agregar URL al textarea
        const textarea = document.getElementById("textareaImagenes");
        textarea.value += data.secure_url + "\n";
      } else {
        mensajeElemento.style.display = "inline";
        mensajeElemento.style.color = "red";
        mensajeElemento.textContent = "Error al subir la imagen";
      }
    } catch (error) {
      console.error("Error al subir la imagen:", error);
      mensajeElemento.style.display = "inline";
      mensajeElemento.style.color = "red";
      mensajeElemento.textContent = "Error al subir la imagen";
      mostrarToast("Error al subir la imagen", "error");
    } finally {
      ocultarSpinner();
    }
  }

  document.getElementById("imageInput").addEventListener("change", subirImagen);
  document.getElementById("btnSubirImagen").addEventListener("click", function () {
    document.getElementById("imageInput").click();

  });
});


