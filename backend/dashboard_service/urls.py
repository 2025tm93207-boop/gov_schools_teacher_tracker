from django.urls import path
from .views import SchoolsView, SchoolTodayView

urlpatterns = [
    path('schools/', SchoolsView.as_view()),
    path('school/<int:school_id>/today/', SchoolTodayView.as_view()),
]