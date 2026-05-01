from rest_framework import serializers
from .models import School, Teacher, Division

class SchoolSerializer(serializers.ModelSerializer):
    headmaster_name = serializers.SerializerMethodField()
    headmaster_phone = serializers.SerializerMethodField()
    headmaster_photo = serializers.SerializerMethodField()

    class Meta:
        model = School
        fields = '__all__'

    def get_headmaster_name(self, obj):
        from auth_service.models import User
        hm = User.objects.filter(school=obj, role='headmaster').first()
        return hm.full_name if hm else ''

    def get_headmaster_phone(self, obj):
        from auth_service.models import User
        hm = User.objects.filter(school=obj, role='headmaster').first()
        return hm.phone if hm else ''

    def get_headmaster_photo(self, obj):
        from auth_service.models import User
        hm = User.objects.filter(school=obj, role='headmaster').first()
        return hm.photo if hm else '/placeholders/headmaster.png'

class TeacherSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    school_name = serializers.CharField(source='user.school.name', read_only=True)

    class Meta:
        model = Teacher
        fields = ['id', 'username', 'full_name', 'phone', 'photo', 'standard', 'division',
                  'salary_block_recommended', 'salary_held', 'school_name']

class DivisionSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.full_name', read_only=True, default='')
    teacher_photo = serializers.CharField(source='teacher.photo', read_only=True, default='')

    class Meta:
        model = Division
        fields = ['id', 'standard', 'division', 'teacher', 'teacher_name', 'teacher_photo', 'student_count']