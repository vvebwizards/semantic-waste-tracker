from SPARQLWrapper import SPARQLWrapper, JSON , POST
import os
from datetime import datetime

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
    """Récupère les producteurs par type spécifique - Version corrigée"""
    try:
        sparql = SPARQLWrapper(FUSEKI_URL + "/query")
        
        print(f"🔍 Recherche par type: '{producer_type}'")
        
        # Mapping avec les noms complets des types (comme ils viennent du frontend)
        type_mapping = {
            "agricole": "Producteur_Agricole",
            "industriel": "Producteur_Industriel", 
            "commercial": "Producteur_Commercial",
            "hospitalier": "Producteur_Hospitalier",
            "residentiel": "Producteur_Residentiel",
            # Ajout des types complets au cas où
            "Producteur_Agricole": "Producteur_Agricole",
            "Producteur_Industriel": "Producteur_Industriel",
            "Producteur_Commercial": "Producteur_Commercial", 
            "Producteur_Hospitalier": "Producteur_Hospitalier",
            "Producteur_Residentiel": "Producteur_Residentiel"
        }
        
        # Récupérer le nom de classe correct
        class_name = type_mapping.get(producer_type, "Producteur")
        producer_class = f"onto:{class_name}"
        
        query = f"""
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
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
        
        bindings = results.get("results", {}).get("bindings", [])
        
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
    """Recherche de producteurs par terme - Version corrigée"""
    try:
        sparql = SPARQLWrapper(FUSEKI_URL + "/query")
        
        print(f"🔍 Recherche globale: '{search_term}'")
        
        query = f"""
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX onto: <http://www.semanticweb.org/wiemb/ontologies/2025/8/untitled-ontology-2#>
        
        SELECT ?producer ?id ?name ?type ?address ?city ?postalCode WHERE {{
            # Chercher toutes les instances de Producteur OU de ses sous-classes
            {{
                ?producer a onto:Producteur .
            }}
            UNION
            {{
                ?producer a ?subclass .
                ?subclass rdfs:subClassOf onto:Producteur .
            }}
            
            ?producer onto:idProducteur ?id .
            ?producer onto:nom ?name .
            OPTIONAL {{ ?producer onto:adresse ?address }}
            OPTIONAL {{ ?producer onto:ville ?city }}
            OPTIONAL {{ ?producer onto:codePostal ?postalCode }}
            
            # Recherche dans le nom, ID ou ville
            FILTER(CONTAINS(LCASE(STR(?name)), LCASE("{search_term}")) || 
                   CONTAINS(LCASE(STR(?id)), LCASE("{search_term}")) ||
                   CONTAINS(LCASE(STR(?city)), LCASE("{search_term}")))
            
            # Récupérer le type réel
            ?producer a ?type .
            FILTER(STRSTARTS(STR(?type), STR(onto:)))
        }}
        ORDER BY ?name
        LIMIT 50
        """
        
        
        sparql.setQuery(query)
        sparql.setReturnFormat(JSON)
        results = sparql.query().convert()
        
        bindings = results.get("results", {}).get("bindings", [])
        
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
    """Récupère les producteurs par ville - Correction du préfixe rdfs"""
    try:
        sparql = SPARQLWrapper(FUSEKI_URL + "/query")
        
        print(f"🔍 Recherche par ville: '{city}'")
        
        query = f"""
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX onto: <http://www.semanticweb.org/wiemb/ontologies/2025/8/untitled-ontology-2#>
        
        SELECT ?producer ?id ?name ?type ?address ?city ?postalCode WHERE {{
            # Chercher toutes les instances de Producteur OU de ses sous-classes
            {{
                ?producer a onto:Producteur .
            }}
            UNION
            {{
                ?producer a ?subclass .
                ?subclass rdfs:subClassOf onto:Producteur .
            }}
            
            ?producer onto:idProducteur ?id .
            ?producer onto:nom ?name .
            ?producer onto:ville ?city .
            OPTIONAL {{ ?producer onto:adresse ?address }}
            OPTIONAL {{ ?producer onto:codePostal ?postalCode }}
            
            # Filtre sur la ville
            FILTER(CONTAINS(LCASE(STR(?city)), LCASE("{city}")))
            
            # Récupérer le type réel
            ?producer a ?type .
            FILTER(STRSTARTS(STR(?type), STR(onto:)))
        }}
        ORDER BY ?name
        """
        
        
        sparql.setQuery(query)
        sparql.setReturnFormat(JSON)
        results = sparql.query().convert()
        
        bindings = results.get("results", {}).get("bindings", [])
        for binding in bindings:
            producer_name = binding.get('name', {}).get('value', 'N/A')
            producer_city = binding.get('city', {}).get('value', 'N/A')
            producer_type = binding.get('type', {}).get('value', 'N/A')
            print(f"   - {producer_name} à {producer_city} (type: {producer_type})")
        
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


def get_producer_by_id(producer_id):
    """Récupère un producteur spécifique par son ID"""
    try:
        sparql = SPARQLWrapper(FUSEKI_URL + "/query")
        query = f"""
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX onto: <http://www.semanticweb.org/wiemb/ontologies/2025/8/untitled-ontology-2#>
        
        SELECT ?producer ?id ?name ?type ?address ?city ?postalCode WHERE {{
            ?producer onto:idProducteur "{producer_id}" .
            ?producer onto:idProducteur ?id .
            ?producer onto:nom ?name .
            ?producer onto:ville ?city .
            OPTIONAL {{ ?producer onto:adresse ?address }}
            OPTIONAL {{ ?producer onto:codePostal ?postalCode }}
            
            ?producer a ?type .
            FILTER(STRSTARTS(STR(?type), STR(onto:)))
        }}
        """
        sparql.setQuery(query)
        sparql.setReturnFormat(JSON)
        results = sparql.query().convert()
        return {"status": "success", "data": results}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def create_producer(producer_id, name, producer_type, city, address="", postal_code=""):
    """Crée un nouveau producteur avec le type spécifié"""
    try:
        sparql = SPARQLWrapper(FUSEKI_URL + "/update")
        
        type_mapping = {
            "agricole": "Producteur_Agricole",
            "industriel": "Producteur_Industriel",
            "commercial": "Producteur_Commercial", 
            "hospitalier": "Producteur_Hospitalier",
            "residentiel": "Producteur_Residentiel"
        }
        
        owl_class = type_mapping.get(producer_type.lower(), "Producteur")
        producer_uri = f"http://www.semanticweb.org/wiemb/ontologies/2025/8/untitled-ontology-2#indiv_{name.replace(' ', '_')}_{producer_id}"
        
        # Construire les triples un par un pour éviter les problèmes de syntaxe
        triples = [
            f'<{producer_uri}> a onto:{owl_class}',
            f'<{producer_uri}> onto:idProducteur "{producer_id}"',
            f'<{producer_uri}> onto:nom "{name.replace('"', '\\"')}"',
            f'<{producer_uri}> onto:ville "{city.replace('"', '\\"')}"',
            f'<{producer_uri}> onto:created_at "{datetime.now().isoformat()}"^^xsd:dateTime'
        ]
        
        if address:
            triples.append(f'<{producer_uri}> onto:adresse "{address.replace('"', '\\"')}"')
        if postal_code:
            triples.append(f'<{producer_uri}> onto:codePostal "{postal_code}"')
        
        query = f"""
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX onto: <http://www.semanticweb.org/wiemb/ontologies/2025/8/untitled-ontology-2#>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        
        INSERT DATA {{
            {" . ".join(triples)} .
        }}
        """
        
        sparql.setQuery(query)
        sparql.setMethod(POST)
        results = sparql.query()
        return {"status": "success", "message": "Producteur créé avec succès", "uri": producer_uri}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def update_producer(producer_uri, name=None, city=None, address=None, postal_code=None):
    """Met à jour les informations d'un producteur"""
    try:
        sparql = SPARQLWrapper(FUSEKI_URL + "/update")
        
        def escape_sparql_string(s):
            if s is None:
                return ""
            return s.replace('\\', '\\\\').replace('"', '\\"').replace("'", "\\'")
        
        updates = []
        
        if name is not None:
            escaped_name = escape_sparql_string(name)
            updates.append(f'<{producer_uri}> onto:nom "{escaped_name}"')
        
        if city is not None:
            escaped_city = escape_sparql_string(city)
            updates.append(f'<{producer_uri}> onto:ville "{escaped_city}"')
        
        if address is not None:
            escaped_address = escape_sparql_string(address)
            updates.append(f'<{producer_uri}> onto:adresse "{escaped_address}"')
        
        if postal_code is not None:
            escaped_postal_code = escape_sparql_string(postal_code)
            updates.append(f'<{producer_uri}> onto:codePostal "{escaped_postal_code}"')
        
        if not updates:
            return {"status": "error", "message": "Aucune donnée à mettre à jour"}
        
        query = f"""
        PREFIX onto: <http://www.semanticweb.org/wiemb/ontologies/2025/8/untitled-ontology-2#>
        
        DELETE {{
            <{producer_uri}> onto:nom ?old_name .
            <{producer_uri}> onto:ville ?old_city .
            <{producer_uri}> onto:adresse ?old_address .
            <{producer_uri}> onto:codePostal ?old_postal .
        }}
        INSERT {{
            {" . ".join(updates)} .
        }}
        WHERE {{
            OPTIONAL {{ <{producer_uri}> onto:nom ?old_name }}
            OPTIONAL {{ <{producer_uri}> onto:ville ?old_city }}
            OPTIONAL {{ <{producer_uri}> onto:adresse ?old_address }}
            OPTIONAL {{ <{producer_uri}> onto:codePostal ?old_postal }}
        }}
        """
        
        sparql.setQuery(query)
        sparql.setMethod(POST)
        results = sparql.query()
        return {"status": "success", "message": "Producteur mis à jour avec succès"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def delete_producer(producer_uri):
    """Supprime un producteur et toutes ses données"""
    try:
        sparql = SPARQLWrapper(FUSEKI_URL + "/update")
        
        query = f"""
        PREFIX onto: <http://www.semanticweb.org/wiemb/ontologies/2025/8/untitled-ontology-2#>
        
        DELETE WHERE {{
            <{producer_uri}> ?p ?o .
        }}
        """
        
        sparql.setQuery(query)
        sparql.setMethod(POST)
        results = sparql.query()
        return {"status": "success", "message": "Producteur supprimé avec succès"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def get_producer_types():
    """Récupère la liste des types de producteurs disponibles"""
    try:
        sparql = SPARQLWrapper(FUSEKI_URL + "/query")
        query = """
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX onto: <http://www.semanticweb.org/wiemb/ontologies/2025/8/untitled-ontology-2#>
        
        SELECT ?type ?label WHERE {
            ?type rdfs:subClassOf onto:Producteur .
            OPTIONAL { ?type rdfs:label ?label }
        }
        ORDER BY ?type
        """
        sparql.setQuery(query)
        sparql.setReturnFormat(JSON)
        results = sparql.query().convert()
        return {"status": "success", "data": results}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def get_producer_wastes_detailed(producer_uri):
    """Récupère tous les déchets d'un producteur spécifique avec détails complets"""
    try:
        sparql = SPARQLWrapper(FUSEKI_URL + "/query")
        
        query = f"""
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX onto: <http://www.semanticweb.org/wiemb/ontologies/2025/8/untitled-ontology-2#>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        
        SELECT ?waste ?id ?name ?type ?weight ?quantity ?dangerLevel ?creationDate ?description WHERE {{
            <{producer_uri}> onto:produit ?waste .
            ?waste onto:idDechet ?id .
            OPTIONAL {{ ?waste onto:nom ?name }}
            OPTIONAL {{ ?waste onto:poids ?weight }}
            OPTIONAL {{ ?waste onto:quantite ?quantity }}
            OPTIONAL {{ ?waste onto:niveauDangerosite ?dangerLevel }}
            OPTIONAL {{ ?waste onto:dateCreation ?creationDate }}
            OPTIONAL {{ ?waste onto:description ?description }}
            
            # Récupérer le type de déchet
            OPTIONAL {{
                ?waste a ?type .
                FILTER(STRSTARTS(STR(?type), STR(onto:)))
            }}
        }}
        ORDER BY DESC(?creationDate) ?id
        """
        
        sparql.setQuery(query)
        sparql.setReturnFormat(JSON)
        results = sparql.query().convert()
        return {"status": "success", "data": results}
        
    except Exception as e:
        return {"status": "error", "message": str(e)}