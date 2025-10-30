from django.urls import path
from . import views

urlpatterns = [
    path('test/', views.TestConnectionView.as_view(), name='test-connection'),
    path('classes/', views.GetClassesView.as_view(), name='get-classes'),
    path('properties/', views.GetClassPropertiesView.as_view(), name='get-properties'),
]