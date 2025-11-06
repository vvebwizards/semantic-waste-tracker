# backend_app/common/producer_queries.py
from SPARQLWrapper import SPARQLWrapper, JSON
import os

# Configuration Fuseki
FUSEKI_URL = os.environ.get("SPARQL_ENDPOINT")

def get_all_producers():
    """Récupère tous les producteurs avec leurs détails"""
    try:
        sparql = SPARQLWrapper(FUSEKI_URL + "/query")
        query = """
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX owl: <http://www.w3.org/2002/07/owl#>
        PREFIX onto: <http://www.semanticweb.org/wiemb/ontologies/2025/8/untitled-ontology-2#>
        
        SELECT ?producer ?id ?name ?type ?address ?city ?postalCode WHERE {
            # Chercher toutes les instances de Producteur OU de ses sous-classes
            {
                ?producer a onto:Producteur .
            }
            UNION
            {
                ?producer a ?subclass .
                ?subclass rdfs:subClassOf onto:Producteur .
            }
            
            ?producer onto:idProducteur ?id .
            ?producer onto:nom ?name .
            OPTIONAL { ?producer onto:adresse ?address }
            OPTIONAL { ?producer onto:ville ?city }
            OPTIONAL { ?producer onto:codePostal ?postalCode }
            
            # Récupérer le type spécifique (la classe réelle)
            ?producer a ?type .
            FILTER(?type != onto:Producteur)
            FILTER(STRSTARTS(STR(?type), STR(onto:)))
        }
        ORDER BY ?name
        """
        sparql.setQuery(query)
        sparql.setReturnFormat(JSON)
        results = sparql.query().convert()
        return {"status": "success", "data": results}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def get_producers_by_type(producer_type):
    """Récupère les producteurs par type spécifique"""
    try:
        sparql = SPARQLWrapper(FUSEKI_URL + "/query")
        
        # Mapping des types pour faciliter l'utilisation
        type_mapping = {
            "agricole": "onto:Producteur_Agricole",
            "industriel": "onto:Producteur_Industriel", 
            "commercial": "onto:Producteur_Commercial",
            "hospitalier": "onto:Producteur_Hospitalier",
            "residentiel": "onto:Producteur_Residentiel"
        }
        
        producer_class = type_mapping.get(producer_type.lower(), "onto:Producteur")
        
        query = f"""
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX owl: <http://www.w3.org/2002/07/owl#>
        PREFIX onto: <http://www.semanticweb.org/wiemb/ontologies/2025/8/untitled-ontology-2#>
        
        SELECT ?producer ?id ?name ?address ?city ?postalCode WHERE {{
            ?producer a {producer_class} .
            ?producer onto:idProducteur ?id .
            ?producer onto:nom ?name .
            OPTIONAL {{ ?producer onto:adresse ?address }}
            OPTIONAL {{ ?producer onto:ville ?city }}
            OPTIONAL {{ ?producer onto:codePostal ?postalCode }}
        }}
        ORDER BY ?name
        """
        sparql.setQuery(query)
        sparql.setReturnFormat(JSON)
        results = sparql.query().convert()
        return {"status": "success", "data": results}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def get_producer_wastes(producer_uri):
    """Récupère les déchets produits par un producteur spécifique"""
    try:
        sparql = SPARQLWrapper(FUSEKI_URL + "/query")
        query = f"""
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX owl: <http://www.w3.org/2002/07/owl#>
        PREFIX onto: <http://www.semanticweb.org/wiemb/ontologies/2025/8/untitled-ontology-2#>
        
        SELECT ?waste ?id ?name ?type ?weight ?quantity ?dangerLevel WHERE {{
            <{producer_uri}> onto:produit ?waste .
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

def get_producers_statistics():
    """Récupère des statistiques sur les producteurs"""
    try:
        sparql = SPARQLWrapper(FUSEKI_URL + "/query")
        query = """
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX owl: <http://www.w3.org/2002/07/owl#>
        PREFIX onto: <http://www.semanticweb.org/wiemb/ontologies/2025/8/untitled-ontology-2#>
        
        SELECT 
            (COUNT(DISTINCT ?producer) AS ?totalProducers)
            (COUNT(DISTINCT ?agricultural) AS ?agriculturalProducers)
            (COUNT(DISTINCT ?industrial) AS ?industrialProducers) 
            (COUNT(DISTINCT ?commercial) AS ?commercialProducers)
            (COUNT(DISTINCT ?hospital) AS ?hospitalProducers)
            (COUNT(DISTINCT ?residential) AS ?residentialProducers)
            (COUNT(DISTINCT ?waste) AS ?totalWastes)
            (SUM(COALESCE(?weight, 0)) AS ?totalWeight)
        WHERE {
            { ?producer a onto:Producteur }
            UNION
            { ?agricultural a onto:Producteur_Agricole }
            UNION  
            { ?industrial a onto:Producteur_Industriel }
            UNION
            { ?commercial a onto:Producteur_Commercial }
            UNION
            { ?hospital a onto:Producteur_Hospitalier }
            UNION
            { ?residential a onto:Producteur_Residentiel }
            UNION
            { 
                ?producer onto:produit ?waste .
                OPTIONAL { ?waste onto:poids ?weight }
            }
        }
        """
        sparql.setQuery(query)
        sparql.setReturnFormat(JSON)
        results = sparql.query().convert()
        return {"status": "success", "data": results}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def search_producers(search_term):
    """Recherche de producteurs par terme"""
    try:
        sparql = SPARQLWrapper(FUSEKI_URL + "/query")
        query = f"""
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX owl: <http://www.w3.org/2002/07/owl#>
        PREFIX onto: <http://www.semanticweb.org/wiemb/ontologies/2025/8/untitled-ontology-2#>
        
        SELECT ?producer ?id ?name ?type ?address ?city WHERE {{
            ?producer a onto:Producteur .
            ?producer onto:idProducteur ?id .
            ?producer onto:nom ?name .
            OPTIONAL {{ ?producer onto:adresse ?address }}
            OPTIONAL {{ ?producer onto:ville ?city }}
            
            FILTER(REGEX(LCASE(STR(?name)), LCASE("{search_term}")) || 
                   REGEX(LCASE(STR(?city)), LCASE("{search_term}")))
            
            # Récupérer le type spécifique
            OPTIONAL {{
                ?producer a ?type .
                FILTER(?type != onto:Producteur)
                FILTER(STRSTARTS(STR(?type), STR(onto:)))
            }}
        }}
        ORDER BY ?name
        LIMIT 50
        """
        sparql.setQuery(query)
        sparql.setReturnFormat(JSON)
        results = sparql.query().convert()
        return {"status": "success", "data": results}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def get_producer_details(producer_uri):
    """Récupère les détails complets d'un producteur spécifique"""
    try:
        sparql = SPARQLWrapper(FUSEKI_URL + "/query")
        query = f"""
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX owl: <http://www.w3.org/2002/07/owl#>
        PREFIX onto: <http://www.semanticweb.org/wiemb/ontologies/2025/8/untitled-ontology-2#>
        
        SELECT ?property ?value WHERE {{
            <{producer_uri}> ?property ?value .
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

def get_producers_by_city(city):
    """Récupère les producteurs par ville"""
    try:
        sparql = SPARQLWrapper(FUSEKI_URL + "/query")
        query = f"""
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX owl: <http://www.w3.org/2002/07/owl#>
        PREFIX onto: <http://www.semanticweb.org/wiemb/ontologies/2025/8/untitled-ontology-2#>
        
        SELECT ?producer ?id ?name ?type ?address ?postalCode WHERE {{
            ?producer a onto:Producteur .
            ?producer onto:idProducteur ?id .
            ?producer onto:nom ?name .
            ?producer onto:ville ?cityValue .
            OPTIONAL {{ ?producer onto:adresse ?address }}
            OPTIONAL {{ ?producer onto:codePostal ?postalCode }}
            
            FILTER(REGEX(LCASE(STR(?cityValue)), LCASE("{city}")))
            
            # Récupérer le type spécifique
            OPTIONAL {{
                ?producer a ?type .
                FILTER(?type != onto:Producteur)
                FILTER(STRSTARTS(STR(?type), STR(onto:)))
            }}
        }}
        ORDER BY ?name
        """
        sparql.setQuery(query)
        sparql.setReturnFormat(JSON)
        results = sparql.query().convert()
        return {"status": "success", "data": results}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def get_producers_with_waste_stats():
    """Récupère les producteurs avec des statistiques sur leurs déchets"""
    try:
        sparql = SPARQLWrapper(FUSEKI_URL + "/query")
        query = """
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX owl: <http://www.w3.org/2002/07/owl#>
        PREFIX onto: <http://www.semanticweb.org/wiemb/ontologies/2025/8/untitled-ontology-2#>
        
        SELECT ?producer ?id ?name ?type ?city 
               (COUNT(?waste) AS ?wasteCount) 
               (SUM(COALESCE(?weight, 0)) AS ?totalWeight)
               (AVG(COALESCE(?dangerLevel, 0)) AS ?avgDangerLevel)
        WHERE {
            ?producer a onto:Producteur .
            ?producer onto:idProducteur ?id .
            ?producer onto:nom ?name .
            OPTIONAL { ?producer onto:ville ?city }
            
            OPTIONAL {
                ?producer onto:produit ?waste .
                OPTIONAL { ?waste onto:poids ?weight }
                OPTIONAL { ?waste onto:niveauDangerosite ?dangerLevel }
            }
            
            # Récupérer le type spécifique
            OPTIONAL {
                ?producer a ?type .
                FILTER(?type != onto:Producteur)
                FILTER(STRSTARTS(STR(?type), STR(onto:)))
            }
        }
        GROUP BY ?producer ?id ?name ?type ?city
        ORDER BY ?name
        """
        sparql.setQuery(query)
        sparql.setReturnFormat(JSON)
        results = sparql.query().convert()
        return {"status": "success", "data": results}
    except Exception as e:
        return {"status": "error", "message": str(e)}