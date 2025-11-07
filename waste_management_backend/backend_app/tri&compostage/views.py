from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from backend_app.common.sparql_utils import fuseki_client

@csrf_exempt
@require_http_methods(["GET"])
def get_centres_tri(request):
    """Récupère tous les centres de tri"""
    sparql_query = """
    PREFIX ex: <http://www.semanticweb.org/wiemb/ontologies/2025/8/untitled-ontology-2#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    
    SELECT ?centre ?nom ?type ?localisation ?capacite ?statut ?debit_tri ?taux_purete WHERE {
        ?centre rdf:type ?centreType .
        ?centreType rdfs:subClassOf* ex:Centre_tri .
        
        ?centre ex:nom ?nom .
        OPTIONAL { ?centre ex:localisation ?localisation }
        OPTIONAL { ?centre ex:capacite_journaliere ?capacite }
        OPTIONAL { ?centre ex:statut_actif ?statut }
        OPTIONAL { ?centre ex:debit_tri_heure ?debit_tri }
        OPTIONAL { ?centre ex:taux_purete_sortie ?taux_purete }
        
        BIND(STRAFTER(STR(?centreType), "#") AS ?type)
    }
    ORDER BY ?nom
    """
    result = fuseki_client.execute_query(sparql_query)
    return JsonResponse(result)

@csrf_exempt
@require_http_methods(["GET"])
def get_centres_compostage(request):
    """Récupère tous les centres de compostage"""
    sparql_query = """
    PREFIX ex: <http://www.semanticweb.org/wiemb/ontologies/2025/8/untitled-ontology-2#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    
    SELECT ?centre ?nom ?type ?localisation ?temperature ?temps_compostage ?statut WHERE {
        ?centre rdf:type ?centreType .
        ?centreType rdfs:subClassOf* ex:Centre_compostage .
        
        ?centre ex:nom ?nom .
        OPTIONAL { ?centre ex:localisation ?localisation }
        OPTIONAL { ?centre ex:temperature_moyenne ?temperature }
        OPTIONAL { ?centre ex:temps_compostage_jours ?temps_compostage }
        OPTIONAL { ?centre ex:statut_actif ?statut }
        
        BIND(STRAFTER(STR(?centreType), "#") AS ?type)
    }
    ORDER BY ?nom
    """
    result = fuseki_client.execute_query(sparql_query)
    return JsonResponse(result)

@csrf_exempt
@require_http_methods(["POST"])
def get_dechets_tries(request):
    """Récupère les déchets triés par un centre spécifique"""
    try:
        data = json.loads(request.body)
        centre_nom = data.get('centre_nom', '')
        
        sparql_query = f"""
        PREFIX ex: <http://www.semanticweb.org/wiemb/ontologies/2025/8/untitled-ontology-2#>
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        
        SELECT ?dechet ?type_dechet ?quantite WHERE {{
            ?centre ex:nom "{centre_nom}" ;
                    ex:trie ?dechet .
            ?dechet ex:nom ?type_dechet ;
                    ex:quantite ?quantite .
        }}
        """
        result = fuseki_client.execute_query(sparql_query)
        return JsonResponse(result)
        
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def get_dechets_compostables(request):
    """Récupère les déchets compostables traités par un centre"""
    try:
        data = json.loads(request.body)
        centre_nom = data.get('centre_nom', '')
        
        sparql_query = f"""
        PREFIX ex: <http://www.semanticweb.org/wiemb/ontologies/2025/8/untitled-ontology-2#>
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        
        SELECT ?dechet ?type_dechet ?quantite WHERE {{
            ?centre ex:nom "{centre_nom}" ;
                    ex:traite_par_compostage ?dechet .
            ?dechet ex:nom ?type_dechet ;
                    ex:quantite ?quantite .
        }}
        """
        result = fuseki_client.execute_query(sparql_query)
        return JsonResponse(result)
        
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def ajouter_centre_tri(request):
    """Ajoute un nouveau centre de tri"""
    try:
        data = json.loads(request.body)
        
        sparql_update = f"""
        PREFIX ex: <http://www.semanticweb.org/wiemb/ontologies/2025/8/untitled-ontology-2#>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        
        INSERT DATA {{
            ex:{data['id']} a ex:{data['type_centre']} ;
                ex:nom "{data['nom']}" ;
                ex:localisation "{data['localisation']}" ;
                ex:capacite_journaliere "{data['capacite']}"^^xsd:decimal ;
                ex:debit_tri_heure "{data['debit_tri']}"^^xsd:decimal ;
                ex:taux_purete_sortie "{data['taux_purete']}"^^xsd:decimal ;
                ex:statut_actif "{data['statut']}"^^xsd:boolean .
        }}
        """
        result = fuseki_client.execute_update(sparql_update)
        return JsonResponse(result)
        
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def ajouter_centre_compostage(request):
    """Ajoute un nouveau centre de compostage"""
    try:
        data = json.loads(request.body)
        
        sparql_update = f"""
        PREFIX ex: <http://www.semanticweb.org/wiemb/ontologies/2025/8/untitled-ontology-2#>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        
        INSERT DATA {{
            ex:{data['id']} a ex:{data['type_centre']} ;
                ex:nom "{data['nom']}" ;
                ex:localisation "{data['localisation']}" ;
                ex:capacite_journaliere "{data['capacite']}"^^xsd:decimal ;
                ex:temperature_moyenne "{data['temperature']}"^^xsd:decimal ;
                ex:temps_compostage_jours "{data['temps_compostage']}"^^xsd:integer ;
                ex:statut_actif "{data['statut']}"^^xsd:boolean .
        }}
        """
        result = fuseki_client.execute_update(sparql_update)
        return JsonResponse(result)
        
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def get_statistiques_tri(request):
    """Récupère les statistiques de tri"""
    sparql_query = """
    PREFIX ex: <http://www.semanticweb.org/wiemb/ontologies/2025/8/untitled-ontology-2#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    
    SELECT ?type_dechet (SUM(?quantite) as ?total_quantite) WHERE {
        ?centre rdf:type ?centreType ;
                ex:trie ?dechet .
        ?centreType rdfs:subClassOf* ex:Centre_tri .
        ?dechet ex:nom ?type_dechet ;
                ex:quantite ?quantite .
    }
    GROUP BY ?type_dechet
    ORDER BY DESC(?total_quantite)
    """
    result = fuseki_client.execute_query(sparql_query)
    return JsonResponse(result)

@csrf_exempt
@require_http_methods(["GET"])
def get_statistiques_compostage(request):
    """Récupère les statistiques de compostage"""
    sparql_query = """
    PREFIX ex: <http://www.semanticweb.org/wiemb/ontologies/2025/8/untitled-ontology-2#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    
    SELECT ?centre ?nom (SUM(?quantite) as ?total_traite) WHERE {
        ?centre rdf:type ?centreType ;
                ex:nom ?nom ;
                ex:traite_par_compostage ?dechet .
        ?centreType rdfs:subClassOf* ex:Centre_compostage .
        ?dechet ex:quantite ?quantite .
    }
    GROUP BY ?centre ?nom
    ORDER BY DESC(?total_traite)
    """
    result = fuseki_client.execute_query(sparql_query)
    return JsonResponse(result)