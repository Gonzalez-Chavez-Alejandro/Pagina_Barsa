#catalogos/models
from django.db import models
from django.db import models
from simple_history.models import HistoricalRecords

class CatalogoURL(models.Model):
    url_pdf = models.URLField(max_length=500)
    uploaded_at = models.DateTimeField(auto_now=True)
    history = HistoricalRecords()

    def __str__(self):
        return self.url_pdf
