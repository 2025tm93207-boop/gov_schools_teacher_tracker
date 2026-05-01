from rest_framework.views import APIView
from rest_framework.response import Response
from school_service.models import School, Teacher
from attendance_service.models import AttendanceSession, AttendanceRecord
from auth_service.models import User
from django.utils import timezone
from drf_spectacular.utils import extend_schema

@extend_schema(tags=['dashboard'])
class SchoolsView(APIView):
    permission_classes = []  # Public

    def get(self, request):
        schools = School.objects.all()
        data = []
        for s in schools:
            hm = User.objects.filter(school=s, role='headmaster').first()
            beo = User.objects.filter(role='beo').first()
            teachers = Teacher.objects.filter(user__school=s)
            data.append({
                'id': s.id,
                'name': s.name,
                'address': s.address,
                'village': s.village,
                'taluka': s.taluka,
                'district': s.district,
                'state': s.state,
                'logo': s.logo,
                'student_count': s.student_count,
                'map_link': s.map_link,
                'phone': s.phone,
                'latitude': s.latitude,
                'longitude': s.longitude,
                'headmaster_name': hm.full_name if hm else '',
                'headmaster_photo': hm.photo if hm else '/placeholders/headmaster.png',
                'beo_name': beo.full_name if beo else '',
                'teacher_count': teachers.count(),
            })
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
                att_status = 'Absent'
                if record:
                    signed_in += 1
                    if record.sign_in_time and record.sign_out_time:
                        att_status = 'Present'
                        present += 1
                    elif record.sign_in_time:
                        att_status = 'Partial'
                data.append({
                    'teacher': teacher.user.username,
                    'teacher_name': teacher.full_name,
                    'standard': teacher.standard,
                    'division': teacher.division,
                    'status': att_status
                })
        return Response({
            'total_teachers': total_teachers,
            'signed_in': signed_in,
            'present': present,
            'not_signed_in': total_teachers - signed_in,
            'teachers': data
        })

@extend_schema(tags=['dashboard'])
class PublicSchoolStatsView(APIView):
    """All schools with high-level monthly stats for public view"""
    permission_classes = []  # Public

    def get(self, request):
        month = int(request.query_params.get('month', timezone.now().month))
        year = int(request.query_params.get('year', timezone.now().year))
        schools = School.objects.all()
        beo = User.objects.filter(role='beo').first()
        result = []

        for school in schools:
            hm = User.objects.filter(school=school, role='headmaster').first()
            teachers = Teacher.objects.filter(user__school=school)
            sessions = AttendanceSession.objects.filter(school=school, date__year=year, date__month=month)
            working_days = sessions.count()

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
                    'teacher_name': teacher.full_name,
                    'standard': teacher.standard,
                    'division': teacher.division,
                    'attendance_percentage': pct,
                })

            avg_pct = round(sum(t['attendance_percentage'] for t in teacher_stats) / len(teacher_stats), 1) if teacher_stats else 0

            result.append({
                'id': school.id,
                'name': school.name,
                'address': school.address,
                'village': school.village,
                'district': school.district,
                'logo': school.logo,
                'student_count': school.student_count,
                'map_link': school.map_link,
                'phone': school.phone,
                'headmaster_name': hm.full_name if hm else '',
                'headmaster_photo': hm.photo if hm else '',
                'beo_name': beo.full_name if beo else '',
                'teacher_count': teachers.count(),
                'working_days': working_days,
                'average_attendance': avg_pct,
                'teachers': teacher_stats,
            })

        return Response(result)

@extend_schema(tags=['dashboard'])
class PublicSchoolDetailView(APIView):
    """Detailed public view of a specific school"""
    permission_classes = []  # Public

    def get(self, request, school_id):
        try:
            school = School.objects.get(id=school_id)
        except School.DoesNotExist:
            return Response({'error': 'School not found'}, status=404)

        hm = User.objects.filter(school=school, role='headmaster').first()
        teachers = Teacher.objects.filter(user__school=school)
        beo = User.objects.filter(role='beo').first()

        # Get stats for current and previous month
        now = timezone.now()
        months_data = []
        for offset in [0, 1]:
            m = now.month - offset
            y = now.year
            if m <= 0:
                m += 12
                y -= 1
            sessions = AttendanceSession.objects.filter(school=school, date__year=y, date__month=m)
            working_days = sessions.count()
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
                    'teacher_name': teacher.full_name,
                    'photo': teacher.photo,
                    'standard': teacher.standard,
                    'division': teacher.division,
                    'present_days': present,
                    'partial_days': partial,
                    'absent_days': working_days - present - partial,
                    'working_days': working_days,
                    'attendance_percentage': pct,
                })
            avg_pct = round(sum(t['attendance_percentage'] for t in teacher_stats) / len(teacher_stats), 1) if teacher_stats else 0
            months_data.append({
                'month': m,
                'year': y,
                'working_days': working_days,
                'average_attendance': avg_pct,
                'teachers': teacher_stats,
            })

        return Response({
            'id': school.id,
            'name': school.name,
            'address': school.address,
            'village': school.village,
            'district': school.district,
            'state': school.state,
            'logo': school.logo,
            'student_count': school.student_count,
            'map_link': school.map_link,
            'phone': school.phone,
            'established_year': school.established_year,
            'headmaster_name': hm.full_name if hm else '',
            'headmaster_photo': hm.photo if hm else '',
            'beo_name': beo.full_name if beo else '',
            'months': months_data,
        })

@extend_schema(tags=['dashboard'])
class AwardsView(APIView):
    """Top-performing schools with >90% avg attendance"""
    permission_classes = []  # Public

    def get(self, request):
        month = int(request.query_params.get('month', timezone.now().month))
        year = int(request.query_params.get('year', timezone.now().year))
        schools = School.objects.all()
        awards = []

        for school in schools:
            teachers = Teacher.objects.filter(user__school=school)
            sessions = AttendanceSession.objects.filter(school=school, date__year=year, date__month=month)
            working_days = sessions.count()
            if working_days == 0:
                continue

            total_pct = 0
            for teacher in teachers:
                present = 0
                partial = 0
                for session in sessions:
                    record = AttendanceRecord.objects.filter(teacher=teacher, session=session).first()
                    if record and record.sign_in_time and record.sign_out_time:
                        present += 1
                    elif record and record.sign_in_time:
                        partial += 1
                total_pct += (present + partial * 0.5) / working_days * 100

            avg_pct = round(total_pct / teachers.count(), 1) if teachers.count() > 0 else 0
            if avg_pct >= 85:
                hm = User.objects.filter(school=school, role='headmaster').first()
                awards.append({
                    'id': school.id,
                    'name': school.name,
                    'logo': school.logo,
                    'village': school.village,
                    'headmaster_name': hm.full_name if hm else '',
                    'average_attendance': avg_pct,
                    'student_count': school.student_count,
                })

        awards.sort(key=lambda x: x['average_attendance'], reverse=True)
        return Response(awards)

@extend_schema(tags=['dashboard'])
class RedFlagsView(APIView):
    """Poorly performing schools with <60% avg attendance"""
    permission_classes = []  # Public

    def get(self, request):
        month = int(request.query_params.get('month', timezone.now().month))
        year = int(request.query_params.get('year', timezone.now().year))
        schools = School.objects.all()
        flags = []

        for school in schools:
            teachers = Teacher.objects.filter(user__school=school)
            sessions = AttendanceSession.objects.filter(school=school, date__year=year, date__month=month)
            working_days = sessions.count()
            if working_days == 0:
                continue

            total_pct = 0
            flagged_teachers = []
            for teacher in teachers:
                present = 0
                partial = 0
                for session in sessions:
                    record = AttendanceRecord.objects.filter(teacher=teacher, session=session).first()
                    if record and record.sign_in_time and record.sign_out_time:
                        present += 1
                    elif record and record.sign_in_time:
                        partial += 1
                t_pct = (present + partial * 0.5) / working_days * 100
                total_pct += t_pct
                if t_pct < 60:
                    flagged_teachers.append({
                        'name': teacher.full_name,
                        'attendance': round(t_pct, 1),
                    })

            avg_pct = round(total_pct / teachers.count(), 1) if teachers.count() > 0 else 0
            if avg_pct < 70 or len(flagged_teachers) > 0:
                hm = User.objects.filter(school=school, role='headmaster').first()
                flags.append({
                    'id': school.id,
                    'name': school.name,
                    'logo': school.logo,
                    'village': school.village,
                    'headmaster_name': hm.full_name if hm else '',
                    'average_attendance': avg_pct,
                    'flagged_teachers': flagged_teachers,
                    'student_count': school.student_count,
                })

        flags.sort(key=lambda x: x['average_attendance'])
        return Response(flags)