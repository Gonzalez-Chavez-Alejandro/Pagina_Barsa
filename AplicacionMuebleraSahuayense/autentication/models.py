from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from simple_history.models import HistoricalRecords

class CustomUserManager(BaseUserManager):
    def create_user(self, username, email, ageUser, phoneUser, password=None, **extra_fields):
        if not email:
            raise ValueError('Este campo es obligatorio')
        if not phoneUser:
            raise ValueError('El telefono es obligatorio')
        if not ageUser:
            raise ValueError('La edad es obligatoria')

        email = self.normalize_email(email)
        user = self.model(
            username=username,
            email=email,
            ageUser=ageUser,
            phoneUser=phoneUser,
            **extra_fields,
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, ageUser, phoneUser, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('El super usuario debe estar en verdadero')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('El super usuario debe estar en verdadero')

        return self.create_user(username, email, ageUser, phoneUser, password, **extra_fields)

class CustomUser(AbstractUser):
    ageUser = models.PositiveIntegerField()
    phoneUser = models.CharField(max_length=20)
    stateUser = models.BooleanField(default=True)
    ubicacionUser = models.TextField(blank=True, null=True)
    history = HistoricalRecords()

    REQUIRED_FIELDS = ['email','ageUser', 'phoneUser']

    objects = CustomUserManager()
