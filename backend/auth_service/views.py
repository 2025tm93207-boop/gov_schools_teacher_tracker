from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User
from drf_spectacular.utils import extend_schema

@extend_schema(tags=['auth'])
class LoginView(APIView):
    permission_classes = []  # Allow unauthenticated access

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            school_data = None
            if user.school:
                school_data = {
                    'id': user.school.id,
                    'name': user.school.name,
                    'address': user.school.address,
                    'village': user.school.village,
                    'district': user.school.district,
                    'state': user.school.state,
                    'logo': user.school.logo,
                    'latitude': user.school.latitude,
                    'longitude': user.school.longitude,
                    'map_link': user.school.map_link,
                    'phone': user.school.phone,
                    'student_count': user.school.student_count,
                }
            # Get teacher info if applicable
            teacher_data = None
            if user.role == 'teacher':
                try:
                    from school_service.models import Teacher
                    teacher = Teacher.objects.get(user=user)
                    teacher_data = {
                        'id': teacher.id,
                        'full_name': teacher.full_name,
                        'standard': teacher.standard,
                        'division': teacher.division,
                        'photo': teacher.photo,
                        'phone': teacher.phone,
                    }
                except Exception:
                    pass
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'role': user.role,
                    'full_name': user.full_name,
                    'phone': user.phone,
                    'photo': user.photo,
                    'school_id': user.school.id if user.school else None,
                    'school': school_data,
                    'teacher': teacher_data,
                }
            })
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@extend_schema(tags=['auth'])
class MeView(APIView):
    def get(self, request):
        user = request.user
        school_data = None
        if user.school:
            school_data = {
                'id': user.school.id,
                'name': user.school.name,
                'address': user.school.address,
                'village': user.school.village,
                'district': user.school.district,
                'state': user.school.state,
                'logo': user.school.logo,
                'latitude': user.school.latitude,
                'longitude': user.school.longitude,
                'map_link': user.school.map_link,
                'phone': user.school.phone,
                'student_count': user.school.student_count,
            }
        teacher_data = None
        if user.role == 'teacher':
            try:
                from school_service.models import Teacher
                teacher = Teacher.objects.get(user=user)
                teacher_data = {
                    'id': teacher.id,
                    'full_name': teacher.full_name,
                    'standard': teacher.standard,
                    'division': teacher.division,
                    'photo': teacher.photo,
                    'phone': teacher.phone,
                }
            except Exception:
                pass
        return Response({
            'id': user.id,
            'username': user.username,
            'role': user.role,
            'full_name': user.full_name,
            'phone': user.phone,
            'photo': user.photo,
            'school_id': user.school.id if user.school else None,
            'school': school_data,
            'teacher': teacher_data,
        })