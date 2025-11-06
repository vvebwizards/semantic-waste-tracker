from django.urls import path
from . import views

urlpatterns = [
    path('test/', views.TestConnectionView.as_view(), name='test-connection'),
    path('classes/', views.GetClassesView.as_view(), name='get-classes'),
    path('properties/', views.GetClassPropertiesView.as_view(), name='get-properties'),

    path('producers/', views.GetAllProducersView.as_view(), name='get_all_producers'),
    path('producers/type/<str:producer_type>/', views.GetProducersByTypeView.as_view(), name='get_producers_by_type'),
    path('producers/wastes/', views.GetProducerWastesView.as_view(), name='get_producer_wastes'),
    path('producers/statistics/', views.GetProducersStatisticsView.as_view(), name='get_producers_statistics'),
    path('producers/search/', views.SearchProducersView.as_view(), name='search_producers'),
    path('producers/details/', views.GetProducerDetailsView.as_view(), name='get_producer_details'),
    path('producers/city/', views.GetProducersByCityView.as_view(), name='get_producers_by_city'),
    path('producers/types/', views.GetProducerTypesView.as_view(), name='get_producer_types'),
    path('producers/create/', views.CreateProducerView.as_view(), name='create_producer'),
    path('producers/<str:producer_id>/', views.GetProducerByIdView.as_view(), name='get_producer_by_id'),
    path('producers/update/<path:producer_uri>/', views.UpdateProducerView.as_view(), name='update_producer'),
    path('producers/delete/<path:producer_uri>', views.DeleteProducerView.as_view(), name='delete_producer'),
]