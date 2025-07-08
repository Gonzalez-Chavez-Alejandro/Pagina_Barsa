from django.core.mail import send_mail
from django.conf import settings
from footer.models import FooterData


def obtener_footer_data():
    footer = FooterData.objects.order_by('-id').first()
    if not footer:
        return None

    return {
        "emails": footer.emails,
        "phones": footer.phones,
        "locations": footer.locations,
        "socials": footer.socials,
    }


def enviar_correo_info_footer(usuario_email, usuario_nombre):
    footer = obtener_footer_data()

    emails = footer["emails"] if footer and footer["emails"] else ["No disponible"]
    phones = footer["phones"] if footer and footer["phones"] else ["No disponible"]
    locations = footer["locations"] if footer and footer["locations"] else ["No disponible"]
    socials = footer["socials"] if footer and footer["socials"] else {}

    socials_html = "<br>".join(
        f'<strong>{key}:</strong> <a href="{val}" style="color:#3b82f6;text-decoration:none;">{val}</a>'
        for key, val in socials.items()
    ) if socials else "No disponibles"

    # ✅ Texto plano de respaldo
    mensaje_texto = f"""
Hola {usuario_nombre},

¡Gracias por confiar en nosotros!

Te compartimos nuestros datos de contacto para definir el método de pago y confirmar la información de tu pedido.

📌 Recomendamos contactarnos por teléfono o Instagram para una atención más rápida.

📞 Horario de atención:
- Lunes a viernes: 9:00 a.m. – 6:00 p.m.
- Domingo: 10:00 a.m. – 3:00 p.m.
- Sábado: Cerrado

📧 Correos:
{chr(10).join(emails)}

📞 Teléfonos:
{chr(10).join(phones)}

📍 Ubicaciones:
{chr(10).join(locations)}

🌐 Redes sociales:
{chr(10).join(f"{k}: {v}" for k, v in socials.items()) if socials else 'No disponibles'}

Quedamos atentos a tu confirmación.
Saludos cordiales,
Distribuidora Mueblera Sahuayense - Barsa Muebles
"""

    # ✅ HTML profesional
    mensaje_html = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {{
      font-family: 'Segoe UI', sans-serif;
      background-color: #f4f4f4;
      color: #333;
      padding: 30px;
    }}
    .container {{
      max-width: 600px;
      margin: auto;
      background-color: #ffffff;
      padding: 25px;
      border-radius: 10px;
      box-shadow: 0 0 10px rgba(0,0,0,0.08);
    }}
    h2 {{
      color: #1f2937;
    }}
    p {{
      line-height: 1.6;
    }}
    .section-title {{
      font-weight: bold;
      color: #374151;
      margin-top: 20px;
    }}
    .info-block {{
      background: #f9fafb;
      padding: 10px 15px;
      border-left: 4px solid #ef4444;
      margin-bottom: 10px;
    }}
    .footer {{
      margin-top: 30px;
      font-size: 0.9em;
      color: #666;
      text-align: center;
    }}
    a {{
      text-decoration: none;
      color: #3b82f6;
    }}
  </style>
</head>
<body>
  <div class="container">
    <h2>¡Gracias por tu pedido, {usuario_nombre}!</h2>
    <p>
      Te compartimos nuestros datos de contacto para definir el método de pago y confirmar la información de tu pedido.
    </p>
    <p><strong>📌 Recomendamos contactarnos por teléfono, Instagram o asistir a nuestras sucursales.</strong> para una atención más rápida.</p>

    <div class="section-title">📞 Horario de atención:</div>
    <div class="info-block">
      Lunes a viernes: 9:00 a.m. – 6:00 p.m.<br>
      Domingo: 10:00 a.m. – 3:00 p.m.<br>
      Sábado: Cerrado
    </div>

    <div class="section-title">📧 Correos de contacto:</div>
    <div class="info-block">
      {"<br>".join(f'<a href="mailto:{email}">{email}</a>' for email in emails)}
    </div>

    <div class="section-title">📞 Teléfonos:</div>
    <div class="info-block">
      {"<br>".join(f'<a href="tel:{tel}">{tel}</a>' for tel in phones)}
    </div>

    <div class="section-title">📍 Ubicaciones:</div>
    <div class="info-block">
      {"<br>".join(locations)}
    </div>

    <div class="section-title">🌐 Redes sociales:</div>
    <div class="info-block">
      {socials_html}
    </div>

    <div class="footer">
      Distribuidora Mueblera Sahuayense – Barsa Muebles
    </div>
  </div>
</body>
</html>
"""

    send_mail(
        subject="Información de contacto - Barsa Muebles",
        message=mensaje_texto,
        from_email=settings.EMAIL_HOST_USER,
        recipient_list=[usuario_email],
        html_message=mensaje_html,
    )
