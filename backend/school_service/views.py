from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import School, Teacher, Division
from .serializers import SchoolSerializer, TeacherSerializer, DivisionSerializer
from rest_framework.permissions import IsAuthenticated
from .permissions import IsHeadmasterOrBEO, IsHeadmaster
from drf_spectacular.utils import extend_schema, extend_schema_view

@extend_schema_view(
    list=extend_schema(tags=['schools']),
    retrieve=extend_schema(tags=['schools']),
)
class SchoolViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = School.objects.all()
    serializer_class = SchoolSerializer
    permission_classes = [IsAuthenticated, IsHeadmasterOrBEO]

@extend_schema_view(
    list=extend_schema(tags=['schools']),
    retrieve=extend_schema(tags=['schools']),
    create=extend_schema(tags=['schools']),
    update=extend_schema(tags=['schools']),
    partial_update=extend_schema(tags=['schools']),
    destroy=extend_schema(tags=['schools']),
)
class TeacherViewSet(viewsets.ModelViewSet):
    serializer_class = TeacherSerializer
    permission_classes = [IsAuthenticated, IsHeadmaster]

    def get_queryset(self):
        school_id = self.kwargs.get('school_pk')
        return Teacher.objects.filter(user__school_id=school_id)

@extend_schema(tags=['schools'])
class SchoolDivisionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, school_id):
        divisions = Division.objects.filter(school_id=school_id).select_related('teacher').order_by('standard', 'division')
        data = []
        for div in divisions:
            data.append({
                'id': div.id,
                'standard': div.standard,
                'division': div.division,
                'student_count': div.student_count,
                'teacher_id': div.teacher.id if div.teacher else None,
                'teacher_name': div.teacher.full_name if div.teacher else 'Unassigned',
                'teacher_photo': div.teacher.photo if div.teacher else '/placeholders/teacher.png',
                'teacher_username': div.teacher.user.username if div.teacher else '',
            })
        return Response(data)

@extend_schema(tags=['schools'])
class SchoolTeachersListView(APIView):
    """List all teachers for a school - accessible by headmaster and BEO"""
    permission_classes = [IsAuthenticated]

    def get(self, request, school_id):
        teachers = Teacher.objects.filter(user__school_id=school_id).select_related('user')
        data = []
        for t in teachers:
            data.append({
                'id': t.id,
                'user_id': t.user.id,
                'username': t.user.username,
                'full_name': t.full_name,
                'phone': t.phone,
                'photo': t.photo,
                'standard': t.standard,
                'division': t.division,
                'salary_block_recommended': t.salary_block_recommended,
                'salary_held': t.salary_held,
            })
        return Response(data)