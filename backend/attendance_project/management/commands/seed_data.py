from django.core.management.base import BaseCommand
from auth_service.models import User
from school_service.models import School, Teacher
from django.contrib.auth.hashers import make_password

class Command(BaseCommand):
    def handle(self, *args, **options):
        # Create schools
        schools_data = [
            {'name': 'ZPPS Nandre', 'lat': 20.9050, 'lon': 74.7730},
            {'name': 'ZPPS Kusumbe', 'lat': 20.9110, 'lon': 74.7790},
            {'name': 'ZPPS Fagne', 'lat': 20.8850, 'lon': 74.7670},
        ]
        schools = []
        for data in schools_data:
            school, _ = School.objects.get_or_create(
                name=data['name'],
                defaults={'latitude': data['lat'], 'longitude': data['lon']}
            )
            schools.append(school)

        # Create users
        users_data = [
            {'username': 'beo_dhule', 'role': 'beo', 'school': None},
            {'username': 'hm_nandre', 'role': 'headmaster', 'school': schools[0]},
            {'username': 'hm_kusumbe', 'role': 'headmaster', 'school': schools[1]},
            {'username': 'hm_fagne', 'role': 'headmaster', 'school': schools[2]},
        ]
        for school in schools:
            for i in range(1, 11):
                users_data.append({
                    'username': f'teacher{i}_{school.name.lower().split()[1]}',
                    'role': 'teacher',
                    'school': school
                })

        for data in users_data:
            user, _ = User.objects.get_or_create(
                username=data['username'],
                defaults={
                    'password': make_password('Test@123'),
                    'role': data['role'],
                    'school': data['school']
                }
            )

        # Create teachers
        for school in schools:
            for i in range(1, 11):
                username = f'teacher{i}_{school.name.lower().split()[1]}'
                user = User.objects.get(username=username)
                standard = (i % 5) + 1
                Teacher.objects.get_or_create(user=user, defaults={'standard': standard})

        self.stdout.write('Data seeded successfully')