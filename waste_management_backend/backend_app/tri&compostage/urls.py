from django.urls import path
from . import views

urlpatterns = [
    # Centres de tri
    path('centres-tri/', views.get_centres_tri, name='get_centres_tri'),
    path('centres-compostage/', views.get_centres_compostage, name='get_centres_compostage'),
    path('dechets-tries/', views.get_dechets_tries, name='get_dechets_tries'),
    path('dechets-compostables/', views.get_dechets_compostables, name='get_dechets_compostables'),
    
    # Ajout de centres
    path('ajouter-tri/', views.ajouter_centre_tri, name='ajouter_centre_tri'),
    path('ajouter-compostage/', views.ajouter_centre_compostage, name='ajouter_centre_compostage'),
    
    # Statistiques
    path('stats-tri/', views.get_statistiques_tri, name='get_statistiques_tri'),
    path('stats-compostage/', views.get_statistiques_compostage, name='get_statistiques_compostage'),
]