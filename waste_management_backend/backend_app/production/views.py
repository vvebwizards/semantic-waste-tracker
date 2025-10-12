from django.http import JsonResponse
from django.views import View
from backend_app.common.sparql_utils import test_sparql_connection

class TestConnectionView(View):
    def get(self, request):
        result = test_sparql_connection()
        return JsonResponse(result)