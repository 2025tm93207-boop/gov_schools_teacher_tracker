from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import AttendanceSession, AttendanceRecord, IssueReport
from school_service.models import Teacher
from .serializers import AttendanceSessionSerializer, AttendanceRecordSerializer, IssueReportSerializer
from django.utils import timezone
from django.utils.timezone import localtime
from django.core.files.base import ContentFile
import base64
from math import radians, sin, cos, sqrt, atan2
from drf_spectacular.utils import extend_schema
from calendar import monthrange

def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    return R * c * 1000

@extend_schema(tags=['attendance'])
class CreateSessionView(APIView):
    def post(self, request):
        if request.user.role != 'headmaster':
            return Response({'error': 'Unauthorized'}, status=403)
        school = request.user.school
        date = request.data.get('date')
        start_time = request.data.get('start_time')
        end_time = request.data.get('end_time')
        session, created = AttendanceSession.objects.get_or_create(
            school=school,
            date=date,
            defaults={
                'start_time': start_time,
                'end_time': end_time
            }
        )
        if not created:
            session.start_time = start_time
            session.end_time = end_time
            session.is_active = True
            session.save()
        return Response(AttendanceSessionSerializer(session).data)

@extend_schema(tags=['attendance'])
class TodaySessionView(APIView):
    def get(self, request):
        school_id = request.query_params.get('school_id')
        if not school_id:
            return Response({'error': 'school_id required'}, status=400)
        session = AttendanceSession.objects.filter(
            school_id=school_id,
            date=timezone.now().date(),
            is_active=True
        ).first()
        if session:
            return Response(AttendanceSessionSerializer(session).data)
        return Response({'message': 'No active session'})

@extend_schema(tags=['attendance'])
class SignInView(APIView):
    def post(self, request):
        teacher = Teacher.objects.get(user=request.user)
        session = AttendanceSession.objects.filter(
            school=teacher.user.school,
            date=timezone.now().date(),
            is_active=True
        ).first()
        if not session:
            return Response({'error': 'No active session'}, status=400)
        selfie_data = request.data.get('selfie')
        lat = float(request.data.get('lat', 0))
        lon = float(request.data.get('lon', 0))
        format, imgstr = selfie_data.split(';base64,')
        ext = format.split('/')[-1]
        data = ContentFile(base64.b64decode(imgstr), name=f'signin_{teacher.user.username}_{localtime(timezone.now()).strftime("%Y%m%d%H%M%S")}.{ext}')
        record, created = AttendanceRecord.objects.get_or_create(teacher=teacher, session=session)
        record.sign_in_time = timezone.now()
        record.sign_in_selfie = data
        record.sign_in_lat = lat
        record.sign_in_lon = lon
        if lat and lon:
            distance = haversine(teacher.user.school.latitude, teacher.user.school.longitude, lat, lon)
            if distance > teacher.user.school.radius:
                record.location_suspicious = True
        record.save()
        return Response({'message': 'Signed in successfully'})

@extend_schema(tags=['attendance'])
class SignOutView(APIView):
    def post(self, request):
        teacher = Teacher.objects.get(user=request.user)
        session = AttendanceSession.objects.filter(
            school=teacher.user.school,
            date=timezone.now().date(),
            is_active=True
        ).first()
        if not session:
            return Response({'error': 'No active session'}, status=400)
        selfie_data = request.data.get('selfie')
        lat = float(request.data.get('lat', 0))
        lon = float(request.data.get('lon', 0))
        format, imgstr = selfie_data.split(';base64,')
        ext = format.split('/')[-1]
        data = ContentFile(base64.b64decode(imgstr), name=f'signout_{teacher.user.username}_{localtime(timezone.now()).strftime("%Y%m%d%H%M%S")}.{ext}')
        record = AttendanceRecord.objects.filter(teacher=teacher, session=session).first()
        if not record or not record.sign_in_time:
            return Response({'error': 'Must sign in first'}, status=400)
        record.sign_out_time = timezone.now()
        record.sign_out_selfie = data
        record.sign_out_lat = lat
        record.sign_out_lon = lon
        if lat and lon:
            distance = haversine(teacher.user.school.latitude, teacher.user.school.longitude, lat, lon)
            if distance > teacher.user.school.radius:
                record.location_suspicious = True
        record.save()
        return Response({'message': 'Signed out successfully'})

@extend_schema(tags=['attendance'])
class MyHistoryView(APIView):
    def get(self, request):
        teacher = Teacher.objects.get(user=request.user)
        records = AttendanceRecord.objects.filter(teacher=teacher).order_by('-session__date')
        return Response(AttendanceRecordSerializer(records, many=True).data)

@extend_schema(tags=['attendance'])
class SchoolTodayView(APIView):
    def get(self, request, school_id):
        if request.user.role not in ['headmaster', 'beo'] or (request.user.role == 'headmaster' and request.user.school.id != int(school_id)):
            return Response({'error': 'Unauthorized'}, status=403)
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
                    'teacher_photo': teacher.photo,
                    'standard': teacher.standard,
                    'division': teacher.division,
                    'status': att_status,
                    'sign_in_time': localtime(record.sign_in_time).strftime('%H:%M') if record and record.sign_in_time else None,
                    'sign_out_time': localtime(record.sign_out_time).strftime('%H:%M') if record and record.sign_out_time else None,
                })
        else:
            for teacher in teachers:
                data.append({
                    'teacher': teacher.user.username,
                    'teacher_name': teacher.full_name,
                    'teacher_photo': teacher.photo,
                    'standard': teacher.standard,
                    'division': teacher.division,
                    'status': 'No Session',
                    'sign_in_time': None,
                    'sign_out_time': None,
                })
        return Response({
            'total_teachers': total_teachers,
            'signed_in': signed_in,
            'present': present,
            'not_signed_in': total_teachers - signed_in,
            'session_active': session.is_active if session else False,
            'teachers': data
        })

@extend_schema(tags=['attendance'])
class TeacherMonthlyView(APIView):
    """Get a teacher's monthly attendance detail"""
    def get(self, request, teacher_id):
        month = int(request.query_params.get('month', timezone.now().month))
        year = int(request.query_params.get('year', timezone.now().year))
        try:
            teacher = Teacher.objects.get(id=teacher_id)
        except Teacher.DoesNotExist:
            return Response({'error': 'Teacher not found'}, status=404)

        sessions = AttendanceSession.objects.filter(
            school=teacher.user.school,
            date__year=year,
            date__month=month
        ).order_by('-date')

        working_days = sessions.count()
        present_days = 0
        partial_days = 0
        absent_days = 0
        records_data = []

        for session in sessions:
            record = AttendanceRecord.objects.filter(teacher=teacher, session=session).first()
            if record and record.sign_in_time and record.sign_out_time:
                att_status = 'Present'
                present_days += 1
            elif record and record.sign_in_time:
                att_status = 'Partial'
                partial_days += 1
            else:
                att_status = 'Absent'
                absent_days += 1
            records_data.append({
                'date': session.date.strftime('%Y-%m-%d'),
                'day': session.date.strftime('%A'),
                'status': att_status,
                'sign_in_time': localtime(record.sign_in_time).strftime('%H:%M') if record and record.sign_in_time else None,
                'sign_out_time': localtime(record.sign_out_time).strftime('%H:%M') if record and record.sign_out_time else None,
            })

        attendance_pct = round((present_days + partial_days * 0.5) / working_days * 100, 1) if working_days > 0 else 0

        return Response({
            'teacher_id': teacher.id,
            'teacher_name': teacher.full_name,
            'teacher_photo': teacher.photo,
            'standard': teacher.standard,
            'division': teacher.division,
            'month': month,
            'year': year,
            'working_days': working_days,
            'present_days': present_days,
            'partial_days': partial_days,
            'absent_days': absent_days,
            'attendance_percentage': attendance_pct,
            'salary_block_recommended': teacher.salary_block_recommended,
            'salary_held': teacher.salary_held,
            'records': records_data,
        })

@extend_schema(tags=['attendance'])
class SchoolMonthlySummaryView(APIView):
    """School monthly summary with teacher-wise stats"""
    def get(self, request, school_id):
        month = int(request.query_params.get('month', timezone.now().month))
        year = int(request.query_params.get('year', timezone.now().year))

        sessions = AttendanceSession.objects.filter(
            school_id=school_id,
            date__year=year,
            date__month=month
        )
        working_days = sessions.count()
        teachers = Teacher.objects.filter(user__school_id=school_id)
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

        avg_pct = round(sum(t['attendance_percentage'] for t in teacher_stats) / len(teacher_stats), 1) if teacher_stats else 0

        return Response({
            'school_id': school_id,
            'month': month,
            'year': year,
            'working_days': working_days,
            'total_teachers': len(teacher_stats),
            'average_attendance': avg_pct,
            'teachers': teacher_stats,
        })

@extend_schema(tags=['attendance'])
class CreateIssueView(APIView):
    """Teacher reports an issue"""
    def post(self, request):
        if request.user.role != 'teacher':
            return Response({'error': 'Only teachers can report issues'}, status=403)
        teacher = Teacher.objects.get(user=request.user)
        issue = IssueReport.objects.create(
            teacher=teacher,
            school=request.user.school,
            category=request.data.get('category', 'other'),
            description=request.data.get('description', ''),
        )
        return Response(IssueReportSerializer(issue).data, status=201)

    def get(self, request):
        school_id = request.query_params.get('school_id')
        if school_id:
            issues = IssueReport.objects.filter(school_id=school_id).order_by('-created_at')
        elif request.user.role == 'teacher':
            teacher = Teacher.objects.get(user=request.user)
            issues = IssueReport.objects.filter(teacher=teacher).order_by('-created_at')
        else:
            issues = IssueReport.objects.none()
        return Response(IssueReportSerializer(issues, many=True).data)

@extend_schema(tags=['attendance'])
class MyMonthlyView(APIView):
    """Current teacher's own monthly attendance"""
    def get(self, request):
        if request.user.role != 'teacher':
            return Response({'error': 'Unauthorized'}, status=403)
        teacher = Teacher.objects.get(user=request.user)
        month = int(request.query_params.get('month', timezone.now().month))
        year = int(request.query_params.get('year', timezone.now().year))

        sessions = AttendanceSession.objects.filter(
            school=teacher.user.school,
            date__year=year,
            date__month=month
        ).order_by('-date')

        working_days = sessions.count()
        present_days = 0
        partial_days = 0
        records_data = []

        for session in sessions:
            record = AttendanceRecord.objects.filter(teacher=teacher, session=session).first()
            if record and record.sign_in_time and record.sign_out_time:
                att_status = 'Present'
                present_days += 1
            elif record and record.sign_in_time:
                att_status = 'Partial'
                partial_days += 1
            else:
                att_status = 'Absent'
            records_data.append({
                'date': session.date.strftime('%Y-%m-%d'),
                'day': session.date.strftime('%A'),
                'status': att_status,
                'sign_in_time': localtime(record.sign_in_time).strftime('%H:%M') if record and record.sign_in_time else None,
                'sign_out_time': localtime(record.sign_out_time).strftime('%H:%M') if record and record.sign_out_time else None,
            })

        pct = round((present_days + partial_days * 0.5) / working_days * 100, 1) if working_days > 0 else 0

        return Response({
            'month': month,
            'year': year,
            'working_days': working_days,
            'present_days': present_days,
            'partial_days': partial_days,
            'absent_days': working_days - present_days - partial_days,
            'attendance_percentage': pct,
            'records': records_data,
        })