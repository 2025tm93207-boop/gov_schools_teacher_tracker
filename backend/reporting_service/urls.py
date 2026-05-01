from django.urls import path
from .views import CalculateMonthlyView, SalaryAlertsView, HoldSalaryView, ReleaseSalaryView, SchoolStatsView

urlpatterns = [
    path('calculate-monthly/', CalculateMonthlyView.as_view()),
    path('salary-alerts/', SalaryAlertsView.as_view()),
    path('hold-salary/', HoldSalaryView.as_view()),
    path('release-salary/', ReleaseSalaryView.as_view()),
    path('school/<int:school_id>/stats/', SchoolStatsView.as_view()),
]