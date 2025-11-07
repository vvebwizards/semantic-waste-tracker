from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import json
from backend_app.supervision.supervisor_queries import (
    get_all_supervisors,
    get_supervisors_by_type,
    get_supervisor_centers,
    get_supervisors_statistics,
    search_supervisors,
    get_supervisor_details,
    add_supervisor,
    delete_supervisor,
    update_supervisor,
)

class GetAllSupervisorsView(View):
    def get(self, request):
        """Récupère tous les superviseurs"""
        result = get_all_supervisors()
        return JsonResponse(result)

class GetSupervisorsByTypeView(View):
    def get(self, request, supervisor_type):
        """Récupère les superviseurs par type"""
        result = get_supervisors_by_type(supervisor_type)
        return JsonResponse(result)

class GetSupervisorCentersView(View):
    def get(self, request):
        """Récupère les centres de traitement assignés à un superviseur spécifique"""
        
        supervisor_uri = request.GET.get('supervisor_uri')
        if not supervisor_uri:
            return JsonResponse({
                "status": "error", 
                "message": "Le paramètre 'supervisor_uri' est requis"
            }, status=400)
        
        result = get_supervisor_centers(supervisor_uri)
        return JsonResponse(result)

class GetSupervisorsStatisticsView(View):
    def get(self, request):
        """Récupère les statistiques des superviseurs"""
        result = get_supervisors_statistics()
        return JsonResponse(result)

class SearchSupervisorsView(View):
    def get(self, request):
        """Recherche de superviseurs par terme"""
        
        search_term = request.GET.get('q', '')
        if not search_term:
            return JsonResponse({
                "status": "error", 
                "message": "Le paramètre de recherche 'q' est requis"
            }, status=400)
        
        result = search_supervisors(search_term)
        return JsonResponse(result)

class GetSupervisorDetailsView(View):
    def get(self, request):
        """Récupère les détails complets d'un superviseur spécifique"""
        
        supervisor_uri = request.GET.get('supervisor_uri')
        if not supervisor_uri:
            return JsonResponse({
                "status": "error", 
                "message": "Le paramètre 'supervisor_uri' est requis"
            }, status=400)
        
        result = get_supervisor_details(supervisor_uri)
        return JsonResponse(result)

@method_decorator(csrf_exempt, name='dispatch')
class AddSupervisorView(View):
    def post(self, request):
        """Ajoute un nouveau superviseur dans l'ontologie"""
        try:
            data = json.loads(request.body)
            
            # Champs obligatoires
            nom_complet = data.get('nomComplet')
            supervisor_type = data.get('type')
            
            if not nom_complet:
                return JsonResponse({
                    "status": "error",
                    "message": "Le champ 'nomComplet' est requis"
                }, status=400)
            
            if not supervisor_type:
                return JsonResponse({
                    "status": "error",
                    "message": "Le champ 'type' est requis"
                }, status=400)
            
            # Types valides
            valid_types = [
                'Superviseur_Environnemental',
                'Superviseur_Municipal',
                'Superviseur_National',
                'Superviseur_Regional',
                'Superviseur_Securite',
                'Superviseur_Qualite'
            ]
            
            if supervisor_type not in valid_types:
                return JsonResponse({
                    "status": "error",
                    "message": f"Type invalide. Types valides: {', '.join(valid_types)}"
                }, status=400)
            
            # Champs optionnels
            email = data.get('email')
            telephone = data.get('telephone')
            fonction = data.get('fonction')
            zone_affectation = data.get('zoneAffectation')
            actif = data.get('actif', True)
            id_superviseur = data.get('idSuperviseur')
            center_uri = data.get('centerUri')
            
            # Debug: imprimer les données reçues
            print(f"DEBUG - Données reçues pour l'ajout de superviseur:")
            print(f"  nomComplet: {nom_complet}")
            print(f"  type: {supervisor_type}")
            print(f"  centerUri: {center_uri}")
            
            # Ajouter le superviseur
            result = add_supervisor(
                nom_complet=nom_complet,
                supervisor_type=supervisor_type,
                email=email,
                telephone=telephone,
                fonction=fonction,
                zone_affectation=zone_affectation,
                actif=actif,
                id_superviseur=id_superviseur,
                center_uri=center_uri
            )
            
            return JsonResponse(result)
            
        except json.JSONDecodeError:
            return JsonResponse({
                "status": "error",
                "message": "Données JSON invalides"
            }, status=400)
        except Exception as e:
            return JsonResponse({
                "status": "error",
                "message": str(e)
            }, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class UpdateSupervisorView(View):
    def put(self, request):
        """Met à jour un superviseur dans l'ontologie"""
        try:
            data = json.loads(request.body)
            
            # URI du superviseur (obligatoire)
            supervisor_uri = data.get('supervisorUri')
            
            if not supervisor_uri:
                return JsonResponse({
                    "status": "error",
                    "message": "Le paramètre 'supervisorUri' est requis"
                }, status=400)
            
            # Champs optionnels pour la mise à jour
            nom_complet = data.get('nomComplet')
            email = data.get('email')
            telephone = data.get('telephone')
            fonction = data.get('fonction')
            zone_affectation = data.get('zoneAffectation')
            actif = data.get('actif')
            center_uri = data.get('centerUri')
            
            # Debug: imprimer les données reçues
            print(f"DEBUG - Données reçues pour la mise à jour de superviseur:")
            print(f"  supervisorUri: {supervisor_uri}")
            print(f"  nomComplet: {nom_complet}")
            print(f"  email: {email}")
            print(f"  telephone: {telephone}")
            print(f"  fonction: {fonction}")
            print(f"  zoneAffectation: {zone_affectation}")
            print(f"  actif: {actif}")
            print(f"  centerUri: {center_uri}")
            
            # Mettre à jour le superviseur
            result = update_supervisor(
                supervisor_uri=supervisor_uri,
                nom_complet=nom_complet,
                email=email,
                telephone=telephone,
                fonction=fonction,
                zone_affectation=zone_affectation,
                actif=actif,
                center_uri=center_uri
            )
            return JsonResponse(result)
            
        except json.JSONDecodeError:
            return JsonResponse({
                "status": "error",
                "message": "Données JSON invalides"
            }, status=400)
        except Exception as e:
            return JsonResponse({
                "status": "error",
                "message": str(e)
            }, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class DeleteSupervisorView(View):
    def delete(self, request):
        """Supprime un superviseur de l'ontologie"""
        try:
            supervisor_uri = request.GET.get('supervisor_uri')
            
            if not supervisor_uri:
                return JsonResponse({
                    "status": "error",
                    "message": "Le paramètre 'supervisor_uri' est requis"
                }, status=400)
            
            # Supprimer le superviseur
            result = delete_supervisor(supervisor_uri)
            return JsonResponse(result)
            
        except Exception as e:
            return JsonResponse({
                "status": "error",
                "message": str(e)
            }, status=500)
