from SPARQLWrapper import SPARQLWrapper, JSON, POST

FUSEKI_URL = "http://localhost:3030/waste_management"

class FusekiClient:
    def __init__(self):
        self.query_endpoint = FUSEKI_URL + "/query"
        self.update_endpoint = FUSEKI_URL + "/update"
    
    def execute_query(self, sparql_query):
        """Execute une requête SPARQL SELECT"""
        try:
            sparql = SPARQLWrapper(self.query_endpoint)
            sparql.setQuery(sparql_query)
            sparql.setReturnFormat(JSON)
            results = sparql.query().convert()
            return {"status": "success", "data": results}
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    def execute_update(self, sparql_update):
        """Execute une requête SPARQL UPDATE (INSERT)"""
        try:
            sparql = SPARQLWrapper(self.update_endpoint)
            sparql.setQuery(sparql_update)
            sparql.setMethod(POST)
            results = sparql.query()
            return {"status": "success", "message": "Update executed successfully"}
        except Exception as e:
            return {"status": "error", "message": str(e)}

fuseki_client = FusekiClient()

def test_sparql_connection():
    """Simple function to test if we can connect to Fuseki"""
    try:
        sparql = SPARQLWrapper(FUSEKI_URL + "/query")
        sparql.setQuery("SELECT * WHERE { ?s ?p ?o } LIMIT 1")
        sparql.setReturnFormat(JSON)
        results = sparql.query().convert()
        return {"status": "success", "message": "Connected to Fuseki!", "data": results}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def get_all_classes():
    """Récupère toutes les classes de l'ontologie"""
    try:
        sparql = SPARQLWrapper(FUSEKI_URL + "/query")
        query = """
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX owl: <http://www.w3.org/2002/07/owl#>
        
        SELECT DISTINCT ?class ?label WHERE {
            ?class a owl:Class .
            OPTIONAL { ?class rdfs:label ?label }
        }
        ORDER BY ?class
        """
        sparql.setQuery(query)
        sparql.setReturnFormat(JSON)
        results = sparql.query().convert()
        return {"status": "success", "data": results}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def get_class_properties(class_uri):
    """Récupère les propriétés d'une classe spécifique"""
    try:
        sparql = SPARQLWrapper(FUSEKI_URL + "/query")
        query = f"""
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX owl: <http://www.w3.org/2002/07/owl#>
        
        SELECT DISTINCT ?property ?label WHERE {{
            ?property rdfs:domain <{class_uri}> .
            OPTIONAL {{ ?property rdfs:label ?label }}
        }}
        ORDER BY ?property
        """
        sparql.setQuery(query)
        sparql.setReturnFormat(JSON)
        results = sparql.query().convert()
        return {"status": "success", "data": results}
    except Exception as e:
        return {"status": "error", "message": str(e)}