import re
from rest_framework import serializers
from .models import Volunteer, Skill, VolunteerSkill, VolunteerAssignment
from apps.beneficiaries.serializers import SanitizedCharField

class SkillSerializer(serializers.ModelSerializer):
    name = SanitizedCharField()
    description = SanitizedCharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = Skill
        fields = '__all__'

class VolunteerSerializer(serializers.ModelSerializer):
    first_name = SanitizedCharField()
    last_name = SanitizedCharField()
    cnic = SanitizedCharField()
    contact_number = SanitizedCharField()

    class Meta:
        model = Volunteer
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

class VolunteerAssignmentSerializer(serializers.ModelSerializer):
    role_description = SanitizedCharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = VolunteerAssignment
        fields = '__all__'
