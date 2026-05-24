import re
from rest_framework import serializers
from django.utils.html import escape
from .models import District, Village, Household, Beneficiary, NeedsAssessment

class SanitizedCharField(serializers.CharField):
    """
    A custom CharField that automatically escapes incoming HTML strings
    to protect the system against XSS payloads.
    """
    def to_internal_value(self, data):
        value = super().to_internal_value(data)
        if isinstance(value, str):
            return escape(value).strip()
        return value

class DistrictSerializer(serializers.ModelSerializer):
    name = SanitizedCharField()

    class Meta:
        model = District
        fields = '__all__'

class VillageSerializer(serializers.ModelSerializer):
    name = SanitizedCharField()
    district_name = serializers.CharField(source='district.name', read_only=True)

    class Meta:
        model = Village
        fields = '__all__'

class HouseholdSerializer(serializers.ModelSerializer):
    household_code = SanitizedCharField()
    water_source = SanitizedCharField()
    village_name = serializers.CharField(source='village.name', read_only=True)
    district_name = serializers.CharField(source='village.district.name', read_only=True)

    class Meta:
        model = Household
        fields = '__all__'

class BeneficiarySerializer(serializers.ModelSerializer):
    first_name = SanitizedCharField()
    last_name = SanitizedCharField()
    cnic = SanitizedCharField()
    contact_number = SanitizedCharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = Beneficiary
        fields = '__all__'

    def validate_cnic(self, value):
        # Auto-format: strip dashes, then reformat
        raw = value.replace('-', '').strip()
        if len(raw) == 13 and raw.isdigit():
            value = f"{raw[:5]}-{raw[5:12]}-{raw[12]}"
        pattern = r'^\d{5}-\d{7}-\d{1}$'
        if not re.match(pattern, value):
            raise serializers.ValidationError("CNIC must be 13 digits (e.g. 3310216755477) or format XXXXX-XXXXXXX-X")
        return value

class NeedsAssessmentSerializer(serializers.ModelSerializer):
    housing_condition = SanitizedCharField()
    comments = SanitizedCharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = NeedsAssessment
        fields = '__all__'

    def validate_poverty_score(self, value):
        if not (1 <= value <= 100):
            raise serializers.ValidationError("Poverty score must be between 1 and 100.")
        return value
