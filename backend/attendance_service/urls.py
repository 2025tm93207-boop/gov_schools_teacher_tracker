from django.urls import path
from .views import CreateSessionView, TodaySessionView, SignInView, SignOutView, MyHistoryView, SchoolTodayView

urlpatterns = [
    path('sessions/', CreateSessionView.as_view()),
    path('sessions/today/', TodaySessionView.as_view()),
    path('sign-in/', SignInView.as_view()),
    path('sign-out/', SignOutView.as_view()),
    path('my-history/', MyHistoryView.as_view()),
    path('school/<int:school_id>/today/', SchoolTodayView.as_view()),
]