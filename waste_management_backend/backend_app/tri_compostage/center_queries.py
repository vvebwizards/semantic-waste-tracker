# backend_app/tri_compostage/center_queries.py
from SPARQLWrapper import SPARQLWrapper, JSON
import os

# Configuration Fuseki
FUSEKI_URL = os.environ.get("SPARQL_ENDPOINT")

def get_all_sorting_centers():
    """Récupère tous les centres de tri avec leurs détails"""
    try:
        sparql = SPARQLWrapper(FUSEKI_URL + "/query")
        query = """
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX owl: <http://www.w3.org/2002/07/owl#>
        PREFIX onto: <http://www.semanticweb.org/wiemb/ontologies/2025/8/untitled-ontology-2#>
        
        SELECT DISTINCT ?center ?id ?nomCentre ?type ?typeCentre ?statutOperationnel ?horairesOuverture ?adresse WHERE {
            # Chercher toutes les instances de Centre_traitement et ses sous-classes
            # (Centre_tri, Centre_compostage, Usine_recyclage)
            {
                ?center a onto:Centre_traitement .
            }
            UNION
            {
                ?center a ?subclass .
                ?subclass rdfs:subClassOf onto:Centre_traitement .
            }
            
            # Récupérer les propriétés - rendre idCentre et nomCentre optionnels au cas où
            OPTIONAL { ?center onto:idCentre ?idCentre }
            OPTIONAL { ?center onto:nomCentre ?nomCentre }
            OPTIONAL { ?center onto:typeCentre ?typeCentre }
            OPTIONAL { ?center onto:statutOperationnel ?statutOperationnel }
            OPTIONAL { ?center onto:horairesOuverture ?horairesOuverture }
            OPTIONAL { ?center onto:adresse ?adresse }
            
            # Utiliser idCentre si disponible, sinon l'URI comme ID
            BIND(COALESCE(?idCentre, REPLACE(STR(?center), "^.*#", "")) AS ?id)
            
            # Récupérer le type spécifique (la classe réelle la plus spécifique)
            ?center a ?type .
            FILTER(STRSTARTS(STR(?type), STR(onto:)))
            # Exclure Centre_traitement et Acteur pour garder les types spécifiques
            FILTER(?type != onto:Centre_traitement)
            FILTER(?type != onto:Acteur)
            # S'assurer qu'on prend le type le plus spécifique (pas une super-classe)
            FILTER(NOT EXISTS {
                ?center a ?moreSpecific .
                ?moreSpecific rdfs:subClassOf ?type .
                FILTER(?moreSpecific != ?type)
                FILTER(STRSTARTS(STR(?moreSpecific), STR(onto:)))
            })
        }
        ORDER BY ?nomCentre
        """
        sparql.setQuery(query)
        sparql.setReturnFormat(JSON)
        results = sparql.query().convert()
        return {"status": "success", "data": results}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def get_sorting_centers_by_type(center_type):
    """Récupère les centres de tri par type spécifique"""
    try:
        sparql = SPARQLWrapper(FUSEKI_URL + "/query")
        
        # Mapping des types pour faciliter l'utilisation
        type_mapping = {
            "automatise": "onto:Centre_Tri_Automatise",
            "manuel": "onto:Centre_Tri_Manuel",
            "optique": "onto:Centre_Tri_Optique",
            "magnetique": "onto:Centre_Tri_Magnetique",
            "densite": "onto:Centre_Tri_Densite",
            "mixte": "onto:Centre_Tri_Mixte"
        }
        
        center_class = type_mapping.get(center_type.lower(), "onto:Centre_tri")
        
        query = f"""
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX owl: <http://www.w3.org/2002/07/owl#>
        PREFIX onto: <http://www.semanticweb.org/wiemb/ontologies/2025/8/untitled-ontology-2#>
        
        SELECT ?center ?id ?nomCentre ?typeCentre ?statutOperationnel ?horairesOuverture ?adresse WHERE {{
            ?center a {center_class} .
            ?center onto:idCentre ?id .
            ?center onto:nomCentre ?nomCentre .
            OPTIONAL {{ ?center onto:typeCentre ?typeCentre }}
            OPTIONAL {{ ?center onto:statutOperationnel ?statutOperationnel }}
            OPTIONAL {{ ?center onto:horairesOuverture ?horairesOuverture }}
            OPTIONAL {{ ?center onto:adresse ?adresse }}
        }}
        ORDER BY ?nomCentre
        """
        sparql.setQuery(query)
        sparql.setReturnFormat(JSON)
        results = sparql.query().convert()
        return {"status": "success", "data": results}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def get_center_wastes(center_uri):
    """Récupère les déchets triés par un centre de tri spécifique"""
    try:
        sparql = SPARQLWrapper(FUSEKI_URL + "/query")
        query = f"""
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX owl: <http://www.w3.org/2002/07/owl#>
        PREFIX onto: <http://www.semanticweb.org/wiemb/ontologies/2025/8/untitled-ontology-2#>
        
        SELECT ?waste ?id ?name ?type ?weight ?quantity ?dangerLevel WHERE {{
            <{center_uri}> onto:trié_par ?waste .
            ?waste onto:idDechet ?id .
            OPTIONAL {{ ?waste onto:nom ?name }}
            OPTIONAL {{ ?waste onto:poids ?weight }}
            OPTIONAL {{ ?waste onto:quantite ?quantity }}
            OPTIONAL {{ ?waste onto:niveauDangerosite ?dangerLevel }}
            
            # Récupérer le type de déchet
            OPTIONAL {{
                ?waste a ?type .
                FILTER(?type != onto:Dechets)
                FILTER(STRSTARTS(STR(?type), STR(onto:)))
            }}
        }}
        ORDER BY ?id
        """
        sparql.setQuery(query)
        sparql.setReturnFormat(JSON)
        results = sparql.query().convert()
        return {"status": "success", "data": results}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def get_sorting_centers_statistics():
    """Récupère des statistiques sur les centres de tri"""
    try:
        sparql = SPARQLWrapper(FUSEKI_URL + "/query")
        query = """
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX owl: <http://www.w3.org/2002/07/owl#>
        PREFIX onto: <http://www.semanticweb.org/wiemb/ontologies/2025/8/untitled-ontology-2#>
        
        SELECT 
            (COUNT(DISTINCT ?center) AS ?totalCenters)
            (COUNT(DISTINCT ?automatise) AS ?automatiseCenters)
            (COUNT(DISTINCT ?manuel) AS ?manuelCenters) 
            (COUNT(DISTINCT ?optique) AS ?optiqueCenters)
            (COUNT(DISTINCT ?magnetique) AS ?magnetiqueCenters)
            (COUNT(DISTINCT ?densite) AS ?densiteCenters)
            (COUNT(DISTINCT ?mixte) AS ?mixteCenters)
            (COUNT(DISTINCT ?enService) AS ?enServiceCenters)
        WHERE {
            { ?center a onto:Centre_tri }
            UNION
            { ?automatise a onto:Centre_Tri_Automatise }
            UNION  
            { ?manuel a onto:Centre_Tri_Manuel }
            UNION
            { ?optique a onto:Centre_Tri_Optique }
            UNION
            { ?magnetique a onto:Centre_Tri_Magnetique }
            UNION
            { ?densite a onto:Centre_Tri_Densite }
            UNION
            { ?mixte a onto:Centre_Tri_Mixte }
            UNION
            { 
                ?center onto:statutOperationnel ?statut .
                FILTER(?statut = "en_service")
            }
        }
        """
        sparql.setQuery(query)
        sparql.setReturnFormat(JSON)
        results = sparql.query().convert()
        return {"status": "success", "data": results}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def search_sorting_centers(search_term):
    """Recherche de centres de tri par terme"""
    try:
        sparql = SPARQLWrapper(FUSEKI_URL + "/query")
        query = f"""
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX owl: <http://www.w3.org/2002/07/owl#>
        PREFIX onto: <http://www.semanticweb.org/wiemb/ontologies/2025/8/untitled-ontology-2#>
        
        SELECT ?center ?id ?nomCentre ?type ?typeCentre ?statutOperationnel WHERE {{
            ?center a onto:Centre_tri .
            ?center onto:idCentre ?id .
            ?center onto:nomCentre ?nomCentre .
            OPTIONAL {{ ?center onto:typeCentre ?typeCentre }}
            OPTIONAL {{ ?center onto:statutOperationnel ?statutOperationnel }}
            
            FILTER(REGEX(LCASE(STR(?nomCentre)), LCASE("{search_term}")) || 
                   REGEX(LCASE(STR(?typeCentre)), LCASE("{search_term}")))
            
            # Récupérer le type spécifique
            OPTIONAL {{
                ?center a ?type .
                FILTER(?type != onto:Centre_tri)
                FILTER(STRSTARTS(STR(?type), STR(onto:)))
            }}
        }}
        ORDER BY ?nomCentre
        LIMIT 50
        """
        sparql.setQuery(query)
        sparql.setReturnFormat(JSON)
        results = sparql.query().convert()
        return {"status": "success", "data": results}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def get_center_details(center_uri):
    """Récupère les détails complets d'un centre de tri spécifique"""
    try:
        sparql = SPARQLWrapper(FUSEKI_URL + "/query")
        query = f"""
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX owl: <http://www.w3.org/2002/07/owl#>
        PREFIX onto: <http://www.semanticweb.org/wiemb/ontologies/2025/8/untitled-ontology-2#>
        
        SELECT ?property ?value WHERE {{
            <{center_uri}> ?property ?value .
            FILTER(STRSTARTS(STR(?property), STR(onto:)))
        }}
        ORDER BY ?property
        """
        sparql.setQuery(query)
        sparql.setReturnFormat(JSON)
        results = sparql.query().convert()
        return {"status": "success", "data": results}
    except Exception as e:
        return {"status": "error", "message": str(e)}

