from django.urls import path
from .views import (CreateSessionView, TodaySessionView, SignInView, SignOutView,
                    MyHistoryView, SchoolTodayView, TeacherMonthlyView,
                    SchoolMonthlySummaryView, CreateIssueView, MyMonthlyView)

urlpatterns = [
    path('sessions/', CreateSessionView.as_view()),
    path('sessions/today/', TodaySessionView.as_view()),
    path('sign-in/', SignInView.as_view()),
    path('sign-out/', SignOutView.as_view()),
    path('my-history/', MyHistoryView.as_view()),
    path('my-monthly/', MyMonthlyView.as_view()),
    path('school/<int:school_id>/today/', SchoolTodayView.as_view()),
    path('school/<int:school_id>/monthly-summary/', SchoolMonthlySummaryView.as_view()),
    path('teacher/<int:teacher_id>/monthly/', TeacherMonthlyView.as_view()),
    path('issues/', CreateIssueView.as_view()),
]