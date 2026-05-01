from rest_framework.views import APIView
from rest_framework.response import Response
from school_service.models import Teacher, School
from attendance_service.models import AttendanceSession, AttendanceRecord
from django.utils import timezone
from calendar import monthrange
from drf_spectacular.utils import extend_schema

@extend_schema(tags=['reporting'])
class CalculateMonthlyView(APIView):
    def post(self, request):
        if request.user.role != 'beo':
            return Response({'error': 'Unauthorized'}, status=403)
        month = int(request.data.get('month', timezone.now().month))
        year = int(request.data.get('year', timezone.now().year))
        results = []
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
                results.append({
                    'teacher': teacher.full_name or teacher.user.username,
                    'school': school.name,
                    'attendance': round(attendance_percent, 1),
                    'blocked': teacher.salary_block_recommended,
                })
        return Response({'message': 'Monthly calculation completed', 'results': results})

@extend_schema(tags=['reporting'])
class SalaryAlertsView(APIView):
    def get(self, request):
        if request.user.role != 'beo':
            return Response({'error': 'Unauthorized'}, status=403)
        teachers = Teacher.objects.filter(salary_block_recommended=True).select_related('user', 'user__school')
        data = []
        for teacher in teachers:
            data.append({
                'teacher_id': teacher.id,
                'user_id': teacher.user.id,
                'teacher': teacher.full_name or teacher.user.username,
                'school': teacher.user.school.name if teacher.user.school else '',
                'standard': teacher.standard,
                'division': teacher.division,
                'salary_held': teacher.salary_held,
                'photo': teacher.photo,
            })
        return Response(data)

@extend_schema(tags=['reporting'])
class HoldSalaryView(APIView):
    def post(self, request):
        if request.user.role != 'beo':
            return Response({'error': 'Unauthorized'}, status=403)
        teacher_id = request.data.get('teacher_id')
        try:
            teacher = Teacher.objects.get(id=teacher_id)
            teacher.salary_held = True
            teacher.save()
            return Response({'message': f'Salary held for {teacher.full_name}'})
        except Teacher.DoesNotExist:
            return Response({'error': 'Teacher not found'}, status=404)

@extend_schema(tags=['reporting'])
class ReleaseSalaryView(APIView):
    def post(self, request):
        if request.user.role != 'beo':
            return Response({'error': 'Unauthorized'}, status=403)
        teacher_id = request.data.get('teacher_id')
        try:
            teacher = Teacher.objects.get(id=teacher_id)
            teacher.salary_held = False
            teacher.salary_block_recommended = False
            teacher.save()
            return Response({'message': f'Salary released for {teacher.full_name}'})
        except Teacher.DoesNotExist:
            return Response({'error': 'Teacher not found'}, status=404)

@extend_schema(tags=['reporting'])
class SchoolStatsView(APIView):
    """Detailed teacher-wise stats for a school"""
    def get(self, request, school_id):
        if request.user.role != 'beo':
            return Response({'error': 'Unauthorized'}, status=403)
        month = int(request.query_params.get('month', timezone.now().month))
        year = int(request.query_params.get('year', timezone.now().year))

        sessions = AttendanceSession.objects.filter(
            school_id=school_id,
            date__year=year,
            date__month=month
        )
        working_days = sessions.count()
        teachers = Teacher.objects.filter(user__school_id=school_id).select_related('user')
        teacher_stats = []

        for teacher in teachers:
            present = 0
            partial = 0
            for session in sessions:
                record = AttendanceRecord.objects.filter(teacher=teacher, session=session).first()
                if record and record.sign_in_time and record.sign_out_time:
                    present += 1
                elif record and record.sign_in_time:
                    partial += 1
            pct = round((present + partial * 0.5) / working_days * 100, 1) if working_days > 0 else 0
            teacher_stats.append({
                'teacher_id': teacher.id,
                'user_id': teacher.user.id,
                'teacher_name': teacher.full_name,
                'teacher_photo': teacher.photo,
                'username': teacher.user.username,
                'standard': teacher.standard,
                'division': teacher.division,
                'present_days': present,
                'partial_days': partial,
                'absent_days': working_days - present - partial,
                'working_days': working_days,
                'attendance_percentage': pct,
                'salary_block_recommended': teacher.salary_block_recommended,
                'salary_held': teacher.salary_held,
            })

        return Response({
            'school_id': school_id,
            'month': month,
            'year': year,
            'working_days': working_days,
            'total_teachers': len(teacher_stats),
            'teachers': teacher_stats,
        })