from django.urls import path
from . import views

urlpatterns = [
    path('supervisors/', views.GetAllSupervisorsView.as_view(), name='get_all_supervisors'),
    path('supervisors/add/', views.AddSupervisorView.as_view(), name='add_supervisor'),
    path('supervisors/update/', views.UpdateSupervisorView.as_view(), name='update_supervisor'),
    path('supervisors/delete/', views.DeleteSupervisorView.as_view(), name='delete_supervisor'),
    path('supervisors/type/<str:supervisor_type>/', views.GetSupervisorsByTypeView.as_view(), name='get_supervisors_by_type'),
    path('supervisors/centers/', views.GetSupervisorCentersView.as_view(), name='get_supervisor_centers'),
    path('supervisors/statistics/', views.GetSupervisorsStatisticsView.as_view(), name='get_supervisors_statistics'),
    path('supervisors/search/', views.SearchSupervisorsView.as_view(), name='search_supervisors'),
    path('supervisors/details/', views.GetSupervisorDetailsView.as_view(), name='get_supervisor_details'),
]
