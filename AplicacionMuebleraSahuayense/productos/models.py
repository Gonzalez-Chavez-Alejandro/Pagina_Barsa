#productos/models
from django.db import models
from autentication.models import CustomUser
from categorias.models import Categorias
from simple_history.models import HistoricalRecords

class Productos(models.Model):
    categoryID = models.ManyToManyField(Categorias, related_name='productos')  # antes era ForeignKey
    nameFurniture = models.CharField(max_length=100)
    descriptionFurniture = models.CharField(max_length=1500)
    priceFurniture = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    porcentajeDescuento = models.DecimalField(max_digits=3, decimal_places=0, default=0)
    stateFurniture = models.BooleanField(default=True)
    userID = models.ForeignKey(CustomUser, on_delete=models.PROTECT, related_name='users')
    imageFurniture = models.TextField(null=True, blank=True)  # Aquí se guardan URLs separadas por coma

    history = HistoricalRecords()

    def __str__(self):
        return self.nameFurniture
