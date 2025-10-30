from django.http import JsonResponse
from django.views import View
from backend_app.common.sparql_utils import test_sparql_connection ,get_all_classes,get_class_properties

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