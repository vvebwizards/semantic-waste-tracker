from SPARQLWrapper import SPARQLWrapper, JSON

# Replace with your actual Fuseki dataset URL
FUSEKI_URL = "http://localhost:3030/waste_management"

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