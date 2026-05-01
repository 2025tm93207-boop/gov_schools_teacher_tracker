from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SchoolViewSet, TeacherViewSet, SchoolDivisionsView, SchoolTeachersListView

router = DefaultRouter()
router.register(r'', SchoolViewSet, basename='schools')
router.register(r'(?P<school_pk>\d+)/teachers', TeacherViewSet, basename='teachers')

urlpatterns = router.urls + [
    path('<int:school_id>/divisions/', SchoolDivisionsView.as_view(), name='school-divisions'),
    path('<int:school_id>/teachers-list/', SchoolTeachersListView.as_view(), name='school-teachers-list'),
]