from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from simple_history.models import HistoricalRecords

User = get_user_model()

class PasswordResetCode(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    code = models.CharField(max_length=6)  
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    history = HistoricalRecords()

    def is_expired(self):
        return timezone.now() > self.created_at + timedelta(hours=1)  

    def __str__(self):
        return f"Code {self.code} for {self.user.username}"

