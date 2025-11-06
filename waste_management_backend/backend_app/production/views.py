from django.http import JsonResponse
from django.views import View
from backend_app.common.sparql_utils import (
    test_sparql_connection, 
    get_all_classes,
    get_class_properties
)
from backend_app.production.producer_queries import (
    get_all_producers,
    get_producers_by_type,
    get_producer_wastes,
    get_producers_statistics,
    search_producers,
    get_producer_details,
    get_producers_by_city,
    get_producers_with_waste_stats
)

class TestConnectionView(View):
    def get(self, request):
        result = test_sparql_connection()
        return JsonResponse(result)

class GetClassesView(View):
    def get(self, request):
        result = get_all_classes()
        return JsonResponse(result)

class GetClassPropertiesView(View):
    def get(self, request):
        class_uri = request.GET.get('class_uri', 'http://www.semanticweb.org/wiemb/ontologies/2025/8/untitled-ontology-2#Acteur')
        result = get_class_properties(class_uri)
        return JsonResponse(result)

class GetAllProducersView(View):
    def get(self, request):
        """Récupère tous les producteurs"""
        result = get_all_producers()
        return JsonResponse(result)

class GetProducersByTypeView(View):
    def get(self, request, producer_type):
        """Récupère les producteurs par type"""
        result = get_producers_by_type(producer_type)
        return JsonResponse(result)

class GetProducerWastesView(View):
    def get(self, request):
        """Récupère les déchets d'un producteur spécifique"""
        
        producer_uri = request.GET.get('producer_uri')
        if not producer_uri:
            return JsonResponse({
                "status": "error", 
                "message": "Le paramètre 'producer_uri' est requis"
            }, status=400)
        
        result = get_producer_wastes(producer_uri)
        return JsonResponse(result)

class GetProducersStatisticsView(View):
    def get(self, request):
        """Récupère les statistiques des producteurs"""
        result = get_producers_statistics()
        return JsonResponse(result)

class SearchProducersView(View):
    def get(self, request):
        """Recherche de producteurs par terme"""
        
        search_term = request.GET.get('q', '')
        if not search_term:
            return JsonResponse({
                "status": "error", 
                "message": "Le paramètre de recherche 'q' est requis"
            }, status=400)
        
        result = search_producers(search_term)
        return JsonResponse(result)

class GetProducerDetailsView(View):
    def get(self, request):
        """Récupère les détails complets d'un producteur spécifique"""
        
        producer_uri = request.GET.get('producer_uri')
        if not producer_uri:
            return JsonResponse({
                "status": "error", 
                "message": "Le paramètre 'producer_uri' est requis"
            }, status=400)
        
        result = get_producer_details(producer_uri)
        return JsonResponse(result)

class GetProducersByCityView(View):
    def get(self, request):
        """Récupère les producteurs par ville"""
        
        city = request.GET.get('city', '')
        if not city:
            return JsonResponse({
                "status": "error", 
                "message": "Le paramètre 'city' est requis"
            }, status=400)
        
        result = get_producers_by_city(city)
        return JsonResponse(result)