from rest_framework.views import APIView
from rest_framework.response import Response
from school_service.models import School, Teacher
from attendance_service.models import AttendanceSession, AttendanceRecord
from django.utils import timezone
from drf_spectacular.utils import extend_schema

@extend_schema(tags=['dashboard'])
class SchoolsView(APIView):
    permission_classes = []  # Public

    def get(self, request):
        schools = School.objects.all()
        data = [{'id': s.id, 'name': s.name} for s in schools]
        return Response(data)

@extend_schema(tags=['dashboard'])
class SchoolTodayView(APIView):
    permission_classes = []  # Public

    def get(self, request, school_id):
        session = AttendanceSession.objects.filter(school_id=school_id, date=timezone.now().date()).first()
        teachers = Teacher.objects.filter(user__school_id=school_id)
        total_teachers = teachers.count()
        signed_in = 0
        present = 0
        data = []
        if session:
            records = AttendanceRecord.objects.filter(session=session)
            for teacher in teachers:
                record = records.filter(teacher=teacher).first()
                status = 'Absent'
                if record:
                    signed_in += 1
                    if record.sign_in_time and record.sign_out_time:
                        status = 'Present'
                        present += 1
                    elif record.sign_in_time:
                        status = 'Partial'
                data.append({
                    'teacher': teacher.user.username,
                    'status': status
                })
        return Response({
            'total_teachers': total_teachers,
            'signed_in': signed_in,
            'present': present,
            'not_signed_in': total_teachers - signed_in,
            'teachers': data
        })