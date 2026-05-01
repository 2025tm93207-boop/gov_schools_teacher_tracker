from django.db import models

class School(models.Model):
    name = models.CharField(max_length=100)
    address = models.CharField(max_length=255, default='')
    village = models.CharField(max_length=100, default='')
    taluka = models.CharField(max_length=100, default='Shirpur')
    district = models.CharField(max_length=100, default='Dhule')
    state = models.CharField(max_length=100, default='Maharashtra')
    latitude = models.FloatField()
    longitude = models.FloatField()
    radius = models.FloatField(default=100.0)  # meters
    logo = models.CharField(max_length=255, default='/placeholders/school_logo.png')
    student_count = models.IntegerField(default=0)
    established_year = models.IntegerField(default=2000)
    map_link = models.URLField(max_length=500, blank=True, default='')
    phone = models.CharField(max_length=20, blank=True, default='')

    def __str__(self):
        return self.name

class Teacher(models.Model):
    user = models.OneToOneField('auth_service.User', on_delete=models.CASCADE)
    full_name = models.CharField(max_length=150, default='')
    phone = models.CharField(max_length=20, blank=True, default='')
    photo = models.CharField(max_length=255, default='/placeholders/teacher.png')
    standard = models.IntegerField(choices=[(i, f'Standard {i}') for i in range(1, 5)])
    division = models.CharField(max_length=5, default='A')
    salary_block_recommended = models.BooleanField(default=False)
    salary_held = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.full_name or self.user.username} - Std {self.standard}{self.division}"

class Division(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='divisions')
    standard = models.IntegerField(choices=[(i, f'Standard {i}') for i in range(1, 5)])
    division = models.CharField(max_length=5, default='A')
    teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_divisions')
    student_count = models.IntegerField(default=0)

    class Meta:
        unique_together = ['school', 'standard', 'division']

    def __str__(self):
        return f"{self.school.name} - Std {self.standard}{self.division}"