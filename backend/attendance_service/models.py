from django.db import models

class AttendanceSession(models.Model):
    school = models.ForeignKey('school_service.School', on_delete=models.CASCADE)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ['school', 'date']

    def __str__(self):
        return f"{self.school.name} - {self.date}"

class AttendanceRecord(models.Model):
    teacher = models.ForeignKey('school_service.Teacher', on_delete=models.CASCADE)
    session = models.ForeignKey(AttendanceSession, on_delete=models.CASCADE)
    sign_in_time = models.DateTimeField(null=True, blank=True)
    sign_out_time = models.DateTimeField(null=True, blank=True)
    sign_in_selfie = models.ImageField(upload_to='selfies/', null=True, blank=True)
    sign_out_selfie = models.ImageField(upload_to='selfies/', null=True, blank=True)
    sign_in_lat = models.FloatField(null=True, blank=True)
    sign_in_lon = models.FloatField(null=True, blank=True)
    sign_out_lat = models.FloatField(null=True, blank=True)
    sign_out_lon = models.FloatField(null=True, blank=True)
    sign_in_verified = models.BooleanField(default=False)
    sign_out_verified = models.BooleanField(default=False)
    location_suspicious = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.teacher.user.username} - {self.session.date}"

class IssueReport(models.Model):
    CATEGORY_CHOICES = [
        ('infrastructure', 'Infrastructure'),
        ('safety', 'Safety'),
        ('resource', 'Resource Shortage'),
        ('other', 'Other'),
    ]
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('acknowledged', 'Acknowledged'),
        ('resolved', 'Resolved'),
    ]
    teacher = models.ForeignKey('school_service.Teacher', on_delete=models.CASCADE)
    school = models.ForeignKey('school_service.School', on_delete=models.CASCADE)
    date = models.DateField(auto_now_add=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='other')
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.teacher.user.username} - {self.category} - {self.date}"