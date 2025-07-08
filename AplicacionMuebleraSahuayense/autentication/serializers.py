from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.core.validators import validate_email
from django.core.exceptions import ValidationError as DjangoValidationError

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    last_name = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['last_name', 'email', 'ageUser', 'phoneUser', 'password']

    def validate_email(self, value):
        try:
            validate_email(value)
        except DjangoValidationError:
            raise serializers.ValidationError({"formato": "El formato del correo electrónico no es válido."})

        if not value.lower().endswith("@gmail.com"):
            raise serializers.ValidationError({"dominio": "Solo se permiten correos @gmail.com."})

        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError({"duplicado": "Este correo ya está registrado."})
        return value

    def validate_ageUser(self, value):
        if not isinstance(value, int) or value < 0:
            raise serializers.ValidationError("La edad debe ser un número positivo.")
        return value

    def validate_password(self, value):
        if len(value) < 6:
            raise serializers.ValidationError("La contraseña debe tener al menos 6 caracteres.")
        return value

    def create(self, validated_data):
        last_name = validated_data.pop('last_name').strip()
        base_username = last_name
        username = base_username
        counter = 1

        # Asegura un username único, aunque tengan el mismo last_name
        while User.objects.filter(username=username).exists():
            username = f"{base_username} {counter}"
            counter += 1

        return User.objects.create_user(
            username=username,
            last_name=last_name,
            email=validated_data['email'],
            ageUser=validated_data['ageUser'],
            phoneUser=validated_data['phoneUser'],
            password=validated_data['password']
        )





from rest_framework import serializers
from django.contrib.auth import password_validation
from django.core.validators import validate_email
from django.core.exceptions import ValidationError as DjangoValidationError
from django.contrib.auth import get_user_model

User = get_user_model()

class UserListSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'ageUser', 'phoneUser','ubicacionUser',  'stateUser', 'is_superuser', 'password','last_name',]
        extra_kwargs = {
            'password': {'write_only': True},
            'stateUser': {'read_only': True},  # Indica eliminación lógica
        }

    def validate_email(self, value):
        # Validar formato de email
        try:
            validate_email(value)
        except DjangoValidationError:
            raise serializers.ValidationError("Formato de correo electrónico inválido.")

        # Validar que email sea único en otros usuarios (excepto el actual)
        user_id = self.instance.id if self.instance else None
        if User.objects.exclude(id=user_id).filter(email__iexact=value).exists():
            raise serializers.ValidationError("Este correo electrónico ya está en uso.")

        return value

    def validate_ageUser(self, value):
        # Validar que sea entero positivo
        if not isinstance(value, int):
            raise serializers.ValidationError("La edad debe ser un número entero.")
        if value < 0:
            raise serializers.ValidationError("La edad no puede ser negativa.")
        return value

    def validate_password(self, value):
        if value:
            if len(value) < 6:
                raise serializers.ValidationError("La contraseña debe tener al menos 6 caracteres.")
            # Validar usando validadores de Django (si tienes configurados)
            password_validation.validate_password(value)
        return value

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)
        instance.save()
        return instance






# autentication/serializers.py

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'username'

    def validate(self, attrs):
        login = attrs.get("username")
        password = attrs.get("password")

        # Buscar por correo o username
        user = User.objects.filter(email=login).first() or User.objects.filter(username=login).first()

        if user is None:
            raise serializers.ValidationError({"username": ["Usuario no encontrado."]})

        if not user.check_password(password):
            raise serializers.ValidationError({"password": ["Contraseña incorrecta."]})

        if not user.is_active:
            raise serializers.ValidationError({"username": ["Cuenta inactiva."]})

        data = super().validate({
            "username": user.username,
            "password": password
        })

        return data














# autentication/serializers.py

# autentication/serializers.py

from rest_framework import serializers
from .models import CustomUser

class SuperUserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'password', 'ageUser', 'phoneUser']
        extra_kwargs = {
            'email': {'required': True},
            'ageUser': {'required': True},
            'phoneUser': {'required': True},
        }

    def create(self, validated_data):
        return CustomUser.objects.create_superuser(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            ageUser=validated_data['ageUser'],
            phoneUser=validated_data['phoneUser']
        )

    def validate_email(self, value):
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este correo ya está registrado.")
        return value


# autentication/serializers.py
from rest_framework import serializers
from .models import CustomUser

class ActualizarUbicacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['ubicacionUser']
