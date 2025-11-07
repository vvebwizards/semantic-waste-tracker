from django.http import JsonResponse
import json
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from datetime import datetime
from urllib.parse import unquote

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
    get_producers_with_waste_stats,
    update_producer,
    delete_producer,
    get_producer_by_id,
    get_producer_types,
    create_producer,
    get_producer_wastes_detailed,


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

@method_decorator(csrf_exempt, name='dispatch')
class GetProducerByIdView(View):
    def get(self, request, producer_id):
        """Récupère un producteur par son ID"""
        result = get_producer_by_id(producer_id)
        return JsonResponse(result)

@method_decorator(csrf_exempt, name='dispatch')
class CreateProducerView(View):
    def post(self, request):
        """Crée un nouveau producteur"""
        try:
            data = json.loads(request.body)
            
            required_fields = ['id', 'name', 'type', 'city']
            for field in required_fields:
                if field not in data:
                    return JsonResponse({
                        "status": "error", 
                        "message": f"Le champ '{field}' est requis"
                    }, status=400)
            
            result = create_producer(
                producer_id=data['id'],
                name=data['name'],
                producer_type=data['type'],
                city=data['city'],
                address=data.get('address', ''),
                postal_code=data.get('postalCode', '')
            )
            return JsonResponse(result)
            
        except json.JSONDecodeError:
            return JsonResponse({
                "status": "error", 
                "message": "Données JSON invalides"
            }, status=400)

@method_decorator(csrf_exempt, name='dispatch')
class UpdateProducerView(View):
    def put(self, request, producer_uri):
        """Met à jour un producteur existant"""
        
        try:
            data = json.loads(request.body)
            
            result = update_producer(
                producer_uri=producer_uri,
                name=data.get('name'),
                city=data.get('city'),
                address=data.get('address'),
                postal_code=data.get('postalCode')
            )
            return JsonResponse(result)
            
        except json.JSONDecodeError:
            return JsonResponse({
                "status": "error", 
                "message": "Données JSON invalides"
            }, status=400)

@method_decorator(csrf_exempt, name='dispatch')
class DeleteProducerView(View):
    def delete(self, request, producer_uri):
        """Supprime un producteur"""
        try:
            decoded_uri = unquote(producer_uri)
         
            
            result = delete_producer(decoded_uri)
            return JsonResponse(result)

        except Exception as e:
            print(f" Erreur dans la vue: {str(e)}")
            return JsonResponse({
                "status": "error",
                "message": f"Erreur lors de la suppression: {str(e)}"
            }, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class GetProducerTypesView(View):
    def get(self, request):
        """Récupère la liste des types de producteurs disponibles"""
        
        result = get_producer_types()
        return JsonResponse(result)

class GetProducerWastesDetailedView(View):
    def get(self, request):
        """Récupère les déchets détaillés d'un producteur spécifique"""
        
        producer_uri = request.GET.get('producer_uri')
        if not producer_uri:
            return JsonResponse({
                "status": "error", 
                "message": "Le paramètre 'producer_uri' est requis"
            }, status=400)
        
        result = get_producer_wastes_detailed(producer_uri)
        return JsonResponse(result)