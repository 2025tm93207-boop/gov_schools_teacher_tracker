from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('auth_service.urls')),
    path('api/schools/', include('school_service.urls')),
    path('api/attendance/', include('attendance_service.urls')),
    path('api/reporting/', include('reporting_service.urls')),
    path('api/public/', include('dashboard_service.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)