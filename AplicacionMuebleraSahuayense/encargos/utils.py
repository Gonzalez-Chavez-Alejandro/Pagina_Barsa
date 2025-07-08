from django.core.mail import send_mail
from django.conf import settings

def enviar_correo_a_empresa(usuario, pedido):
    asunto = f"📦 Nuevo pedido #{pedido.id} - Cliente: {usuario.last_name}"

    productos = pedido.productos_encargados.select_related('producto').all()

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{
                font-family: Arial, sans-serif; 
                line-height: 1.6; 
                color: #333; 
                margin: 0; padding: 0;
            }}
            .header {{ 
    display: flex;
    align-items: center; /* centra verticalmente */
    gap: 15px; /* espacio entre imagen y texto */
    background-color: #f8f9fa;
    padding: 15px;
    border-radius: 5px;
  }}
  .header img {{ 
    max-width: 150px;
  }}
            .header-info {{
                display: flex;
                flex-direction: column;
                justify-content: center;
                font-size: 1.1em;
                color: #2c3e50;
            }}
            .header-info strong {{
                font-weight: 700;
            }}
            .order-info {{
                margin: 20px 0; 
                padding: 15px; 
                background-color: #f1f8ff; 
                border-left: 4px solid #4a90e2;
            }}
            .product {{
                margin-bottom: 15px; 
                padding: 10px; 
                background-color: #f9f9f9; 
                border-radius: 3px;
            }}
            .product-name {{
                font-weight: bold; 
                color: #2c3e50;
            }}
            .price-detail {{
                margin-left: 20px; 
                color: #555;
            }}
            .total {{
                font-size: 1.2em; 
                font-weight: bold; 
                color: #27ae60; 
                padding: 10px; 
                background-color: #e8f5e9; 
                border-radius: 3px;
            }}
            .warning {{
                color: #e74c3c; 
                background-color: #fde8e8; 
                padding: 10px; 
                border-radius: 3px;
            }}
            .separator {{
                height: 1px; 
                background-color: #eee; 
                margin: 20px 0;
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <img src="https://res.cloudinary.com/dacrpsl5p/image/upload/v1745430695/Logo-Negro_nfvywi.png" alt="Logo BarSamuebles" />
            <div class="header-info">
            
                
                
            </div>
        </div>

        <div class="order-info">
            <div><strong>📦Nuevo pedido #{pedido.id}</strong></div>
            <p><strong>👤 Cliente:</strong> {usuario.username}</p>
            <p><strong>📧 Email:</strong> {usuario.email}</p>
            <p><strong>📍 Ubicación de entrega:</strong> {pedido.ubicacion_entrega}</p>
        </div>

        <h3>🛍️ Productos solicitados:</h3>
    """

    text_content = f"""
📋 Nuevo pedido #{pedido.id} de {usuario.username}
───────────────────────────────────────
📧 Email: {usuario.email}
📍 Ubicación: {pedido.ubicacion_entrega}
───────────────────────────────────────

🛒 Productos solicitados:
"""

    total = 0
    productos_sin_precio = []

    for item in productos:
        producto = item.producto
        nombre = producto.nameFurniture
        cantidad = item.cantidad
        precio_base = float(producto.priceFurniture)
        descuento = float(producto.porcentajeDescuento or 0)
        precio_con_descuento = precio_base * (1 - descuento / 100)
        subtotal = precio_con_descuento * cantidad

        html_content += f"""
        <div class="product">
            <div class="product-name">{nombre} ({cantidad} unidad{'es' if cantidad > 1 else ''})</div>
            <div class="price-detail">
                <div>Precio original: ${precio_base:,.2f}</div>
                <div>Descuento aplicado: {descuento:.0f}%</div>
                <div>Precio con descuento: ${precio_con_descuento:,.2f}</div>
                <div><strong>Subtotal: ${subtotal:,.2f}</strong></div>
            </div>
        </div>
        """

        text_content += f"""
• {nombre} ({cantidad} unidad{'es' if cantidad > 1 else ''})
    - Precio original:       ${precio_base:8.2f}
    - Descuento aplicado:   {descuento:7.0f}%
    - Precio con descuento: ${precio_con_descuento:8.2f}
    - Subtotal:             ${subtotal:8.2f}
"""

        if precio_con_descuento == 0:
            productos_sin_precio.append(nombre)
        else:
            total += subtotal

    html_content += f"""
    <div class="separator"></div>
    <div class="total">💰 Total del pedido: ${total:,.2f}</div>
    """

    text_content += f"""
───────────────────────────────────────
💰 Total del pedido: ${total:.2f}
───────────────────────────────────────
"""

    if productos_sin_precio:
        html_content += f"""
        <div class="warning">
            <h4>⚠️ Atención</h4>
            <p>Los siguientes productos no tienen un precio definido:</p>
            <ul>
        """

        text_content += "\n⚠️ Atención: Los siguientes productos no tienen un precio definido:\n"

        for nombre in productos_sin_precio:
            html_content += f"<li>{nombre}</li>"
            text_content += f"  • {nombre}\n"

        html_content += """
            </ul>
        </div>
        """
        text_content += "───────────────────────────────────────\n"

    html_content += """
    </body>
    </html>
    """

    send_mail(asunto, text_content, settings.EMAIL_HOST_USER,
              ["imgbarsamueblespaginaweb@gmail.com"],
              html_message=html_content)
