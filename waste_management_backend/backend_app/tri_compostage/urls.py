from django.urls import path
from . import views

urlpatterns = [
    path('centers/', views.GetAllSortingCentersView.as_view(), name='get_all_sorting_centers'),
    path('centers/type/<str:center_type>/', views.GetSortingCentersByTypeView.as_view(), name='get_sorting_centers_by_type'),
    path('centers/wastes/', views.GetCenterWastesView.as_view(), name='get_center_wastes'),
    path('centers/statistics/', views.GetSortingCentersStatisticsView.as_view(), name='get_sorting_centers_statistics'),
    path('centers/search/', views.SearchSortingCentersView.as_view(), name='search_sorting_centers'),
    path('centers/details/', views.GetCenterDetailsView.as_view(), name='get_center_details'),
]
