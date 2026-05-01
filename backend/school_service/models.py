from django.db import models

class School(models.Model):
    name = models.CharField(max_length=100)
    latitude = models.FloatField()
    longitude = models.FloatField()
    radius = models.FloatField(default=100.0)  # meters

    def __str__(self):
        return self.name

class Teacher(models.Model):
    user = models.OneToOneField('auth_service.User', on_delete=models.CASCADE)
    standard = models.IntegerField(choices=[(i, f'Standard {i}') for i in range(1, 6)])
    salary_block_recommended = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username} - Std {self.standard}"