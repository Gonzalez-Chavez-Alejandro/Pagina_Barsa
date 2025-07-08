from django.db import models
from autentication.models import CustomUser
from productos.models import Productos
from simple_history.models import HistoricalRecords

class Encargo(models.Model):
    ESTADOS = (
        ('carrito', 'Carrito'),
        ('procesado', 'Procesado'),
        ('enviado', 'Enviado'),
        ('entregado', 'Entregado'),
        ('cancelado', 'Cancelado'),
        ('papelera', 'Papelera'),
        ('pendiente', 'Pendiente'),
    )

    usuario = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='encargos')
    fecha = models.DateTimeField(auto_now_add=True)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    estado = models.CharField(max_length=20, choices=ESTADOS, default='carrito')
    ubicacion_entrega = models.TextField(blank=True, null=True)

    history = HistoricalRecords()  

    def __str__(self):
        return f"Encargo #{self.id} de {self.usuario.username} - Estado: {self.get_estado_display()}"


class ProductoEncargado(models.Model):
    encargo = models.ForeignKey(Encargo, on_delete=models.CASCADE, related_name='productos_encargados')
    producto = models.ForeignKey(Productos, on_delete=models.PROTECT)
    cantidad = models.PositiveIntegerField()
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)  # precio al momento del encargo

    def subtotal(self):
        return self.cantidad * self.precio_unitario

    def __str__(self):
        return f"{self.cantidad} x {self.producto.nameFurniture} en encargo #{self.encargo.id}"
