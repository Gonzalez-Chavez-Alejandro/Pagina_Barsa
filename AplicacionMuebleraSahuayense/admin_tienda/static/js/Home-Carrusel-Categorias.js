function getPlaceholderImage(text = 'Imagen no disponible', width = 150, height = 100) {
  return `https://dummyimage.com/${width}x${height}/cccccc/969696&text=${encodeURIComponent(text)}`;
}

function normalizeImageUrl(url) {
  if (!url) return getPlaceholderImage();
  if (url.startsWith("https://res.cloudinary.com/")) return url;
  if (url.includes("https://res.cloudinary.com/")) {
    const index = url.indexOf("https://res.cloudinary.com/");
    return url.slice(index);
  }
  return getPlaceholderImage();
}

document.addEventListener("DOMContentLoaded", async () => {
  const carousel = document.getElementById('carouselCategorias');

  try {
    const response = await fetch("/categorias/publicas/");
    const data = await response.json();

    data.forEach(cat => {
      const card = document.createElement('div');
      card.className = 'card';

      const imagen = normalizeImageUrl(cat.imagenCategory);
      const nombre = cat.nameCategory || 'Sin nombre';
      const descripcion = cat.descriptionCategory || '';

      card.innerHTML = `
        <img src="${imagen}" alt="${nombre}">
        <h3>${nombre}</h3>
        <p>${descripcion}</p>
      `;

      // Aquí redirige con cat.id para filtrar productos por categoría
      card.addEventListener("click", () => {
        window.location.href = `/productos/?categoria=${cat.id}`;
      });

      carousel.appendChild(card);
    });

    function scrollCarousel(direction) {
      const scrollAmount = 300;
      carousel.scrollBy({ left: scrollAmount * direction, behavior: 'smooth' });
    }

    const leftArrow = document.getElementById('leftArrow');
    const rightArrow = document.getElementById('rightArrow');

    if (leftArrow && rightArrow) {
      leftArrow.addEventListener('click', () => scrollCarousel(-1));
      rightArrow.addEventListener('click', () => scrollCarousel(1));
    }
  } catch (error) {
    console.error("Error al cargar categorías:", error);
    carousel.innerHTML = "<p>Error al cargar categorías.</p>";
    mostrarToast("Error al cargar categorías.", "error");
  }
});