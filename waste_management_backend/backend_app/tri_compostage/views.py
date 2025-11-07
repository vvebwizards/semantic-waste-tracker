from django.http import JsonResponse
from django.views import View
from backend_app.tri_compostage.center_queries import (
    get_all_sorting_centers,
    get_sorting_centers_by_type,
    get_center_wastes,
    get_sorting_centers_statistics,
    search_sorting_centers,
    get_center_details,
)

class GetAllSortingCentersView(View):
    def get(self, request):
        """Récupère tous les centres de tri"""
        result = get_all_sorting_centers()
        return JsonResponse(result)

class GetSortingCentersByTypeView(View):
    def get(self, request, center_type):
        """Récupère les centres de tri par type"""
        result = get_sorting_centers_by_type(center_type)
        return JsonResponse(result)

class GetCenterWastesView(View):
    def get(self, request):
        """Récupère les déchets triés par un centre de tri spécifique"""
        
        center_uri = request.GET.get('center_uri')
        if not center_uri:
            return JsonResponse({
                "status": "error", 
                "message": "Le paramètre 'center_uri' est requis"
            }, status=400)
        
        result = get_center_wastes(center_uri)
        return JsonResponse(result)

class GetSortingCentersStatisticsView(View):
    def get(self, request):
        """Récupère les statistiques des centres de tri"""
        result = get_sorting_centers_statistics()
        return JsonResponse(result)

class SearchSortingCentersView(View):
    def get(self, request):
        """Recherche de centres de tri par terme"""
        
        search_term = request.GET.get('q', '')
        if not search_term:
            return JsonResponse({
                "status": "error", 
                "message": "Le paramètre de recherche 'q' est requis"
            }, status=400)
        
        result = search_sorting_centers(search_term)
        return JsonResponse(result)

class GetCenterDetailsView(View):
    def get(self, request):
        """Récupère les détails complets d'un centre de tri spécifique"""
        
        center_uri = request.GET.get('center_uri')
        if not center_uri:
            return JsonResponse({
                "status": "error", 
                "message": "Le paramètre 'center_uri' est requis"
            }, status=400)
        
        result = get_center_details(center_uri)
        return JsonResponse(result)

