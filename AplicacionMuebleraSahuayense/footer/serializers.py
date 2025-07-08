#serializer/foother
from rest_framework import serializers
from .models import FooterData

class FooterDataSerializer(serializers.ModelSerializer):
    emails = serializers.ListField(
        child=serializers.EmailField(),
        allow_empty=True,
        required=False
    )
    
    class Meta:
        model = FooterData
        fields = '__all__'

