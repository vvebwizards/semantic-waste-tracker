from django.shortcuts import render

from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json
from backend_app.common.sparql_utils import fuseki_client
from backend_app.common.ai_parser import extract_entities,generate_sparql_from_entities

@csrf_exempt
def query_view(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            question = data.get("question", "")
            print("DEBUG question text:", question)
            if not question:
                return JsonResponse({"status": "error", "message": "Question is required"}, status=400)

            entities = extract_entities(question)
            sparql_query = generate_sparql_from_entities(entities)
            print("DEBUG entities:", entities)
            print("DEBUG generated SPARQL:\n", sparql_query)
            results = fuseki_client.execute_query(sparql_query)

            return JsonResponse(results)

        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=500)
    else:
        return JsonResponse({"status": "error", "message": "Only POST method allowed"}, status=405)

