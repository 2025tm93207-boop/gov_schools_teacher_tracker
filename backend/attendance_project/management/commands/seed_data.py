from django.core.management.base import BaseCommand
from auth_service.models import User
from school_service.models import School, Teacher, Division
from attendance_service.models import AttendanceSession, AttendanceRecord
from django.contrib.auth.hashers import make_password
from django.utils import timezone
from datetime import date, time, datetime, timedelta
import random

class Command(BaseCommand):
    def handle(self, *args, **options):
        self.stdout.write('Clearing existing data...')
        AttendanceRecord.objects.all().delete()
        AttendanceSession.objects.all().delete()
        Division.objects.all().delete()
        Teacher.objects.all().delete()
        User.objects.all().delete()
        School.objects.all().delete()

        # ── Schools ──────────────────────────────────────────
        schools_data = [
            {
                'name': 'ZPPS Nandre',
                'address': 'Near Gram Panchayat Office, Nandre',
                'village': 'Nandre',
                'taluka': 'Shirpur',
                'district': 'Dhule',
                'lat': 21.3500, 'lon': 74.8800,
                'student_count': 285,
                'established_year': 1972,
                'map_link': 'https://maps.google.com/?q=21.3500,74.8800',
                'phone': '02563-254100',
            },
            {
                'name': 'ZPPS Kusumbe',
                'address': 'Main Road, Near Post Office, Kusumbe',
                'village': 'Kusumbe',
                'taluka': 'Shirpur',
                'district': 'Dhule',
                'lat': 21.3650, 'lon': 74.8950,
                'student_count': 210,
                'established_year': 1985,
                'map_link': 'https://maps.google.com/?q=21.3650,74.8950',
                'phone': '02563-254200',
            },
            {
                'name': 'ZPPS Fagne',
                'address': 'Village Center, Near Temple, Fagne',
                'village': 'Fagne',
                'taluka': 'Shirpur',
                'district': 'Dhule',
                'lat': 21.3300, 'lon': 74.8600,
                'student_count': 175,
                'established_year': 1990,
                'map_link': 'https://maps.google.com/?q=21.3300,74.8600',
                'phone': '02563-254300',
            },
        ]

        schools = []
        for data in schools_data:
            school = School.objects.create(
                name=data['name'],
                address=data['address'],
                village=data['village'],
                taluka=data['taluka'],
                district=data['district'],
                latitude=data['lat'],
                longitude=data['lon'],
                student_count=data['student_count'],
                established_year=data['established_year'],
                map_link=data['map_link'],
                phone=data['phone'],
                logo='/placeholders/school_logo.png',
            )
            schools.append(school)
        self.stdout.write(f'Created {len(schools)} schools')

        # ── BEO User ────────────────────────────────────────
        beo_user = User.objects.create(
            username='beo_dhule',
            password=make_password('Test@123'),
            role='beo',
            school=None,
            full_name='Shri Rajesh Patil',
            phone='02562-233100',
            photo='/placeholders/beo.png',
        )
        self.stdout.write(f'Created BEO: {beo_user.full_name}')

        # ── Headmasters ─────────────────────────────────────
        hm_data = [
            {'username': 'hm_nandre', 'full_name': 'Shri Vinod Chavan', 'phone': '9876543210', 'school': schools[0]},
            {'username': 'hm_kusumbe', 'full_name': 'Smt Sunita Deshmukh', 'phone': '9876543211', 'school': schools[1]},
            {'username': 'hm_fagne', 'full_name': 'Shri Anil Patil', 'phone': '9876543212', 'school': schools[2]},
        ]
        for data in hm_data:
            User.objects.create(
                username=data['username'],
                password=make_password('Test@123'),
                role='headmaster',
                school=data['school'],
                full_name=data['full_name'],
                phone=data['phone'],
                photo='/placeholders/headmaster.png',
            )
        self.stdout.write('Created 3 headmasters')

        # ── Teacher Names (realistic regional names) ─────────
        teacher_names = [
            # School 0 (Nandre) - 8 assigned + 2 substitute
            ['Smt Kavita Jadhav', 'Shri Ramesh Wagh', 'Smt Priya Sonawane', 'Shri Manoj Pawar',
             'Smt Anita Bhosale', 'Shri Suresh Gaikwad', 'Smt Rekha More', 'Shri Prakash Kale',
             'Smt Vaishali Nikam', 'Shri Dinesh Ahire'],
            # School 1 (Kusumbe) - 8 assigned + 2 substitute
            ['Shri Ganesh Mahajan', 'Smt Sarita Borse', 'Shri Vijay Deore', 'Smt Manisha Sapkal',
             'Shri Ashok Sonar', 'Smt Pushpa Girase', 'Shri Nilesh Pardeshi', 'Smt Jyoti Bari',
             'Shri Sandip Thorat', 'Smt Lata Deokar'],
            # School 2 (Fagne) - 8 assigned + 2 substitute
            ['Smt Manda Dhole', 'Shri Rajendra Salve', 'Smt Sunanda Gavhane', 'Shri Kiran Bachhav',
             'Smt Nirmala Wani', 'Shri Bhagwan Thakre', 'Smt Usha Shinde', 'Shri Sanjay Lokhande',
             'Smt Meena Joshi', 'Shri Arun Suryawanshi'],
        ]

        # Division mapping: Std 1-4, divisions A and B = 8 teachers
        divisions_template = [
            (1, 'A'), (1, 'B'), (2, 'A'), (2, 'B'),
            (3, 'A'), (3, 'B'), (4, 'A'), (4, 'B'),
        ]

        all_teachers = []  # Store (teacher_obj, school_index) for attendance seeding

        for school_idx, school in enumerate(schools):
            school_suffix = school.name.lower().split()[1]
            school_teachers = []

            for i in range(10):
                if school_idx == 0 and i < 2:
                    username = f'teacher{i+1}'
                else:
                    username = f'teacher{i+1}_{school_suffix}'
                full_name = teacher_names[school_idx][i]
                # First 8 teachers get assigned divisions, last 2 are substitutes
                if i < 8:
                    std, div = divisions_template[i]
                else:
                    std = (i % 4) + 1
                    div = 'S'  # Substitute

                user = User.objects.create(
                    username=username,
                    password=make_password('Test@123'),
                    role='teacher',
                    school=school,
                    full_name=full_name,
                    phone=f'98765{school_idx}{i:04d}',
                    photo='/placeholders/teacher.png',
                )
                teacher = Teacher.objects.create(
                    user=user,
                    full_name=full_name,
                    phone=user.phone,
                    photo='/placeholders/teacher.png',
                    standard=std,
                    division=div,
                )
                school_teachers.append(teacher)

                # Create division mapping for assigned teachers
                if i < 8:
                    student_ct = random.randint(25, 45)
                    Division.objects.create(
                        school=school,
                        standard=std,
                        division=div,
                        teacher=teacher,
                        student_count=student_ct,
                    )

            all_teachers.append(school_teachers)
        self.stdout.write('Created 30 teachers and 24 divisions')

        # ── Attendance Data for April 2026 (previous month) ──
        self.stdout.write('Generating April 2026 attendance data...')
        self._generate_monthly_attendance(schools, all_teachers, 2026, 4)

        # ── Attendance Data for May 2026 (current month, up to yesterday) ──
        self.stdout.write('Generating May 2026 attendance data...')
        self._generate_monthly_attendance(schools, all_teachers, 2026, 5)

        # ── Ensure Active Session for Today (no records) ──
        self.stdout.write('Ensuring active sessions for today...')
        today = date.today()
        for school in schools:
            AttendanceSession.objects.get_or_create(
                school=school,
                date=today,
                defaults={
                    'start_time': time(9, 0),
                    'end_time': time(10, 0),
                    'is_active': True
                }
            )

        self.stdout.write(self.style.SUCCESS('Data seeded successfully!'))

    def _generate_monthly_attendance(self, schools, all_teachers, year, month):
        """Generate realistic attendance for a month"""
        today = date.today()

        # Determine working days (exclude Sundays, and for current month only up to today)
        from calendar import monthrange
        _, last_day = monthrange(year, month)
        working_dates = []
        for day in range(1, last_day + 1):
            d = date(year, month, day)
            if d >= today:
                break
            if d.weekday() != 6:  # Exclude Sunday
                working_dates.append(d)

        if not working_dates:
            return

        # Define attendance profiles for variation
        # Index: teacher index within school
        # High performers: ~90-100%, Medium: ~70-85%, Low: ~40-55%
        profiles = [
            'high', 'high', 'high', 'medium', 'medium',
            'high', 'medium', 'high', 'low', 'medium'
        ]

        for school_idx, school in enumerate(schools):
            school_teachers = all_teachers[school_idx]

            for work_date in working_dates:
                # Create session
                session = AttendanceSession.objects.create(
                    school=school,
                    date=work_date,
                    start_time=time(9, 0),
                    end_time=time(9, 30),
                    is_active=(work_date == today),
                )

                for t_idx, teacher in enumerate(school_teachers):
                    profile = profiles[t_idx]
                    roll = random.random() * 100

                    if profile == 'high':
                        # 90-100% attendance
                        if roll < 95:
                            status = 'present'
                        elif roll < 98:
                            status = 'partial'
                        else:
                            status = 'absent'
                    elif profile == 'medium':
                        # 70-85% attendance
                        if roll < 78:
                            status = 'present'
                        elif roll < 88:
                            status = 'partial'
                        else:
                            status = 'absent'
                    else:  # low
                        # 40-55% attendance
                        if roll < 45:
                            status = 'present'
                        elif roll < 55:
                            status = 'partial'
                        else:
                            status = 'absent'

                    if status == 'present':
                        sign_in_dt = timezone.make_aware(
                            datetime.combine(work_date, time(8, random.randint(45, 59), random.randint(0, 59)))
                        )
                        sign_out_dt = timezone.make_aware(
                            datetime.combine(work_date, time(14, random.randint(0, 30), random.randint(0, 59)))
                        )
                        AttendanceRecord.objects.create(
                            teacher=teacher,
                            session=session,
                            sign_in_time=sign_in_dt,
                            sign_out_time=sign_out_dt,
                            sign_in_lat=school.latitude + random.uniform(-0.0005, 0.0005),
                            sign_in_lon=school.longitude + random.uniform(-0.0005, 0.0005),
                            sign_out_lat=school.latitude + random.uniform(-0.0005, 0.0005),
                            sign_out_lon=school.longitude + random.uniform(-0.0005, 0.0005),
                            sign_in_verified=True,
                            sign_out_verified=True,
                        )
                    elif status == 'partial':
                        sign_in_dt = timezone.make_aware(
                            datetime.combine(work_date, time(9, random.randint(0, 29), random.randint(0, 59)))
                        )
                        AttendanceRecord.objects.create(
                            teacher=teacher,
                            session=session,
                            sign_in_time=sign_in_dt,
                            sign_in_lat=school.latitude + random.uniform(-0.0005, 0.0005),
                            sign_in_lon=school.longitude + random.uniform(-0.0005, 0.0005),
                            sign_in_verified=True,
                        )
                    # absent = no record

        self.stdout.write(f'  Created {len(working_dates)} working days of attendance for {month}/{year}')