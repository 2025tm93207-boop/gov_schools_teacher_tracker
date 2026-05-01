from rest_framework import viewsets
from .models import School, Teacher
from .serializers import SchoolSerializer, TeacherSerializer
from rest_framework.permissions import IsAuthenticated
from .permissions import IsHeadmasterOrBEO, IsHeadmaster
from drf_spectacular.utils import extend_schema_view

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