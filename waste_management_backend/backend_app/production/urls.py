from django.urls import path
from . import views

urlpatterns = [
    path('test/', views.TestConnectionView.as_view(), name='test-connection'),
]