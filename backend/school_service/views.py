from rest_framework import viewsets
from .models import School, Teacher
from .serializers import SchoolSerializer, TeacherSerializer
from rest_framework.permissions import IsAuthenticated
from .permissions import IsHeadmasterOrBEO, IsHeadmaster

class SchoolViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = School.objects.all()
    serializer_class = SchoolSerializer
    permission_classes = [IsAuthenticated, IsHeadmasterOrBEO]

class TeacherViewSet(viewsets.ModelViewSet):
    serializer_class = TeacherSerializer
    permission_classes = [IsAuthenticated, IsHeadmaster]

    def get_queryset(self):
        school_id = self.kwargs.get('school_pk')
        return Teacher.objects.filter(user__school_id=school_id)