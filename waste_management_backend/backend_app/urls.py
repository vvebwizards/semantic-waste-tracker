from django.urls import path
from .views import query_view,sparql_query_view

urlpatterns = [
    path("nlp_query/", query_view, name="nlp_query"),
    path("sparql/", sparql_query_view, name="sparql_query"),
]
