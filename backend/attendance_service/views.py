from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import AttendanceSession, AttendanceRecord
from school_service.models import Teacher
from .serializers import AttendanceSessionSerializer, AttendanceRecordSerializer
from django.utils import timezone
from django.core.files.base import ContentFile
import base64
from math import radians, sin, cos, sqrt, atan2
from drf_spectacular.utils import extend_schema

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
        session = AttendanceSession.objects.create(
            school=school,
            date=date,
            start_time=start_time,
            end_time=end_time
        )
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
        data = ContentFile(base64.b64decode(imgstr), name=f'signin_{teacher.user.username}_{timezone.now().strftime("%Y%m%d%H%M%S")}.{ext}')
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
        data = ContentFile(base64.b64decode(imgstr), name=f'signout_{teacher.user.username}_{timezone.now().strftime("%Y%m%d%H%M%S")}.{ext}')
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