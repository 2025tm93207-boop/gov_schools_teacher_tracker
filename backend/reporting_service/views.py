from rest_framework.views import APIView
from rest_framework.response import Response
from school_service.models import Teacher, School
from attendance_service.models import AttendanceSession, AttendanceRecord
from django.utils import timezone
from calendar import monthrange

class CalculateMonthlyView(APIView):
    def post(self, request):
        if request.user.role != 'beo':
            return Response({'error': 'Unauthorized'}, status=403)
        month = int(request.data.get('month', timezone.now().month))
        year = int(request.data.get('year', timezone.now().year))
        _, last_day = monthrange(year, month)
        for school in School.objects.all():
            teachers = Teacher.objects.filter(user__school=school)
            for teacher in teachers:
                sessions = AttendanceSession.objects.filter(
                    school=school,
                    date__year=year,
                    date__month=month
                )
                working_days = sessions.count()
                if working_days == 0:
                    continue
                present_days = 0
                for session in sessions:
                    record = AttendanceRecord.objects.filter(teacher=teacher, session=session).first()
                    if record and record.sign_in_time and record.sign_out_time:
                        present_days += 1
                    elif record and record.sign_in_time:
                        present_days += 0.5
                attendance_percent = (present_days / working_days) * 100
                teacher.salary_block_recommended = attendance_percent < 60
                teacher.save()
        return Response({'message': 'Monthly calculation completed'})

class SalaryAlertsView(APIView):
    def get(self, request):
        if request.user.role != 'beo':
            return Response({'error': 'Unauthorized'}, status=403)
        teachers = Teacher.objects.filter(salary_block_recommended=True)
        data = []
        for teacher in teachers:
            data.append({
                'teacher': teacher.user.username,
                'school': teacher.user.school.name,
                'standard': teacher.standard
            })
        return Response(data)