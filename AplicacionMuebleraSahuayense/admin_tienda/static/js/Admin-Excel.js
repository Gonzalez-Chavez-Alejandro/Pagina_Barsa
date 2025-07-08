async function exportarProductosAExcel() {
  const productos = modoFiltrado ? productosFiltrados : productosGlobal;

  if (!productos.length) {
    mostrarToast("No hay productos para exportar", "error");
    return;
  }

  async function fetchImageAsBuffer(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error("No se pudo descargar la imagen");
    return await response.arrayBuffer();
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'BARSA';
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet('Productos', {
    pageSetup: { orientation: 'landscape' }
  });

  let imageBuffer;
  try {
    imageBuffer = await fetchImageAsBuffer("https://res.cloudinary.com/dacrpsl5p/image/upload/v1745430695/Logo-Negro-B_-_copia_v1estv.png");
  } catch (e) {
    console.warn("No se pudo cargar la imagen del logo:", e);
  }

  if (imageBuffer) {
    const imageId = workbook.addImage({
      buffer: imageBuffer,
      extension: 'png',
    });

    // Imagen más pequeña: A1 a B3
    worksheet.addImage(imageId, {
      tl: { col: 0, row: 0 },
      br: { col: 2, row: 3 }
    });

    // Poner fondo blanco en celdas A1, B1, A2, B2, A3, B3
    [1, 2, 3].forEach(rowNum => {
      const row = worksheet.getRow(rowNum);
      [1, 2].forEach(colNum => {
        const cell = row.getCell(colNum);
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFFFFF' }
        };
      });
    });
  }

  // Mover título y fecha una celda a la izquierda (C1 a I1)
  worksheet.mergeCells('C1:I1');
  const titleCell = worksheet.getCell('C1');
  titleCell.value = 'PRODUCTOS BARSA';
  titleCell.font = { size: 24, bold: true, name: 'Calibri', color: { argb: 'FF003366' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  titleCell.fill = { type: 'pattern', pattern:'solid', fgColor: { argb:'FFD9E1F2' } };
  worksheet.getRow(1).height = 30;

  worksheet.mergeCells('C2:I2');
  const dateCell = worksheet.getCell('C2');
  dateCell.value = `Fecha de exportación: ${new Date().toLocaleDateString('es-MX')} ${new Date().toLocaleTimeString('es-MX')}`;
  dateCell.font = { italic: true, size: 11, color: { argb: 'FF666666' }, name: 'Calibri' };
  dateCell.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(2).height = 18;

  // Fila vacía con fondo blanco
  const emptyRow = worksheet.addRow([]);
  for (let col = 1; col <= 9; col++) {
    const cell = emptyRow.getCell(col);
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
  }
  emptyRow.height = 10;

  // Encabezados
  const headers = [
    "ID", "Estado", "Nombre", "Descripción",
    "Precio", "Descuento", "Precio Oferta",
    "Categorías", "Imágenes"
  ];
  const headerRow = worksheet.addRow(headers);

  headerRow.eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, name: 'Calibri', size: 12 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = {
      top: { style: 'medium', color: { argb: 'FF000000' } },
      left: { style: 'medium', color: { argb: 'FF000000' } },
      bottom: { style: 'medium', color: { argb: 'FF000000' } },
      right: { style: 'medium', color: { argb: 'FF000000' } }
    };
  });
  worksheet.getRow(headerRow.number).height = 22;

  // Datos
  productos.forEach(producto => {
    const categorias = Array.isArray(producto.categorias_nombres)
      ? producto.categorias_nombres.join('\n')
      : "-";

    const imagenes = producto.imageFurniture
      ? producto.imageFurniture.split(',').map(url => url.trim()).join('\n')
      : "-";

    const descuento = Math.min(producto.porcentajeDescuento || 0, 100);
    const precioOferta = producto.PrecioOferta && !isNaN(producto.PrecioOferta)
      ? Number(producto.PrecioOferta).toFixed(2)
      : Number(producto.priceFurniture).toFixed(2);

    const row = worksheet.addRow([
      producto.id,
      producto.stateFurniture ? "Activo" : "Inactivo",
      producto.nameFurniture || "-",
      producto.descriptionFurniture || "-",
      `$${Number(producto.priceFurniture).toFixed(2)}`,
      `${descuento}%`,
      `$${precioOferta}`,
      categorias,
      imagenes
    ]);

    row.height = 40;

    const centerCols = [1, 2, 6, 7];
    const rightCols = [5];
    const leftCols = [3, 4, 8, 9];

    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFBFBFBF' } },
        left: { style: 'thin', color: { argb: 'FFBFBFBF' } },
        bottom: { style: 'thin', color: { argb: 'FFBFBFBF' } },
        right: { style: 'thin', color: { argb: 'FFBFBFBF' } }
      };

      if (centerCols.includes(colNumber)) {
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      } else if (rightCols.includes(colNumber)) {
        cell.alignment = { horizontal: 'right', vertical: 'middle', wrapText: true };
      } else if (leftCols.includes(colNumber)) {
        cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
      } else {
        cell.alignment = { horizontal: 'left', vertical: 'middle' };
      }

      if ([6, 7].includes(colNumber)) {
        if (descuento > 0) {
          cell.font = { bold: true, color: { argb: 'FF006100' }, name: 'Calibri', size: 11 };
        } else {
          cell.font = { name: 'Calibri', size: 11 };
        }
      } else {
        cell.font = { name: 'Calibri', size: 11 };
      }
    });
  });

  worksheet.columns = [
    { width: 8 },
    { width: 10 },
    { width: 30 },
    { width: 50 },
    { width: 14 },
    { width: 12 },
    { width: 14 },
    { width: 25 },
    { width: 100 }
  ];

  worksheet.views = [{ state: 'frozen', ySplit: 4 }];

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `productos_barsa_${new Date().toISOString().slice(0,10)}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}