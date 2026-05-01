from rest_framework import serializers
from .models import AttendanceSession, AttendanceRecord, IssueReport

class AttendanceSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceSession
        fields = '__all__'

class AttendanceRecordSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.full_name', read_only=True)
    teacher_username = serializers.CharField(source='teacher.user.username', read_only=True)
    date = serializers.DateField(source='session.date', read_only=True)

    class Meta:
        model = AttendanceRecord
        fields = '__all__'

class IssueReportSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.full_name', read_only=True)

    class Meta:
        model = IssueReport
        fields = '__all__'