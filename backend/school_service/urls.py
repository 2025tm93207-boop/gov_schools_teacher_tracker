from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SchoolViewSet, TeacherViewSet

router = DefaultRouter()
router.register(r'', SchoolViewSet, basename='schools')
router.register(r'(?P<school_pk>\d+)/teachers', TeacherViewSet, basename='teachers')

urlpatterns = router.urls