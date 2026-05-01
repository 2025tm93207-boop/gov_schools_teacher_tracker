from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = [
        ('headmaster', 'Headmaster'),
        ('teacher', 'Teacher'),
        ('beo', 'Block Education Officer'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='teacher')
    school = models.ForeignKey('school_service.School', on_delete=models.SET_NULL, null=True, blank=True)
    full_name = models.CharField(max_length=150, blank=True, default='')
    phone = models.CharField(max_length=20, blank=True, default='')
    photo = models.CharField(max_length=255, blank=True, default='')

    def __str__(self):
        return f"{self.full_name or self.username} ({self.role})"