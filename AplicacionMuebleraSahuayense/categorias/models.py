#models.py categorias 
from simple_history.models import HistoricalRecords
from cloudinary.models import CloudinaryField
import cloudinary.uploader
from django.db import models

class Categorias(models.Model):
    nameCategory = models.CharField(max_length=100) 
    descriptionCategory = models.CharField(max_length=225)
    imagenCategory = CloudinaryField(
        'image',
        folder='categorias/',
        overwrite=True,
        resource_type='image',
    )
    history = HistoricalRecords()  

    def __str__(self):
        return self.nameCategory

    def save(self, *args, **kwargs):
        if hasattr(self.imagenCategory, 'file'):  # ¡Importante! Esto detecta si es un archivo recién subido.
            upload_result = cloudinary.uploader.upload(
                self.imagenCategory,
                public_id=f"categorias/{self.nameCategory.replace(' ','_')}",
                folder='categorias/',
            )
            self.imagenCategory = upload_result['secure_url']
        super().save(*args, **kwargs)