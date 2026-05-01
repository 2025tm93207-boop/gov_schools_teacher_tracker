from django.urls import path
from .views import SchoolsView, SchoolTodayView, PublicSchoolStatsView, PublicSchoolDetailView, AwardsView, RedFlagsView

urlpatterns = [
    path('schools/', SchoolsView.as_view()),
    path('schools/stats/', PublicSchoolStatsView.as_view()),
    path('school/<int:school_id>/today/', SchoolTodayView.as_view()),
    path('school/<int:school_id>/details/', PublicSchoolDetailView.as_view()),
    path('awards/', AwardsView.as_view()),
    path('red-flags/', RedFlagsView.as_view()),
]