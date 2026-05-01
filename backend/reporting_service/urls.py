from django.urls import path
from .views import CalculateMonthlyView, SalaryAlertsView

urlpatterns = [
    path('calculate-monthly/', CalculateMonthlyView.as_view()),
    path('salary-alerts/', SalaryAlertsView.as_view()),
]