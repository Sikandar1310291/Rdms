from rest_framework import serializers
from .models import Project
from apps.beneficiaries.serializers import SanitizedCharField

class ProjectSerializer(serializers.ModelSerializer):
    name = SanitizedCharField()
    villages = serializers.PrimaryKeyRelatedField(
        many=True,
        required=False,
        read_only=False,
        queryset=__import__('apps.beneficiaries.models', fromlist=['Village']).Village.objects.all()
    )

    class Meta:
        model = Project
        fields = '__all__'

    def create(self, validated_data):
        villages = validated_data.pop('villages', [])
        project = Project.objects.create(**validated_data)
        project.villages.set(villages)
        return project

    def update(self, instance, validated_data):
        villages = validated_data.pop('villages', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if villages is not None:
            instance.villages.set(villages)
        return instance
