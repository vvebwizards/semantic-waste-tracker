from django.shortcuts import render
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import JsonResponse
from backend_app.common.sparql_utils import fuseki_client
from backend_app.common.auth_queries import AuthQueries
import json
import uuid

@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            
            required_fields = ['username', 'password', 'email', 'role']
            for field in required_fields:
                if field not in data:
                    return JsonResponse({
                        'status': 'error', 
                        'message': f'Champ manquant: {field}'
                    }, status=400)
            
            username = data['username']
            password = data['password']
            email = data['email']
            role = data['role']
            nom = data.get('nom', '')
            adresse = data.get('adresse', '')
            ville = data.get('ville', '')
            code_postal = data.get('codePostal', '')
            
            check_query = AuthQueries.check_username_exists(username)
            check_result = fuseki_client.execute_query(check_query)
            
            if check_result['status'] == 'success' and check_result['data']['boolean']:
                return JsonResponse({
                    'status': 'error',
                    'message': 'Ce nom d\'utilisateur existe déjà'
                }, status=400)
            
            user_id = f"user_{uuid.uuid4().hex[:8]}"
            register_query = register_query = AuthQueries.register_user(
                            user_id=user_id,
                            username=username,
                            password=password, 
                            email=email,
                            role=role,
                            sous_role=data.get('sous_role', role),  
                            nom=nom,
                            adresse=adresse,
                            ville=ville,
                            code_postal=code_postal
                        )
            
            result = fuseki_client.execute_update(register_query)
            
            if result['status'] == 'success':
                return JsonResponse({
                    'status': 'success',
                    'message': 'Utilisateur créé avec succès',
                    'user_id': user_id
                })
            else:
                return JsonResponse({
                    'status': 'error',
                    'message': result['message']
                }, status=500)
                
        except json.JSONDecodeError:
            return JsonResponse({
                'status': 'error',
                'message': 'Données JSON invalides'
            }, status=400)
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class LoginView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            print("📨 Login attempt:", data)
            
            username = data.get('username')
            password = data.get('password')
            
            if not username or not password:
                return JsonResponse({
                    'status': 'error',
                    'message': 'Username et password requis'
                }, status=400)
            
            login_query = AuthQueries.login_user(username, password)
            result = fuseki_client.execute_query(login_query)
            
            if result['status'] == 'success':
                bindings = result['data']['results']['bindings']
                
                if len(bindings) > 0:
                    user_data = bindings[0]
                    return JsonResponse({
                        'status': 'success',
                        'message': 'Connexion réussie',
                        'user': {
                            'uri': user_data['user']['value'],
                            'role': user_data['role']['value'].split('#')[-1],
                            'sous_role': user_data['sous_role']['value'],  # ← NOUVEAU
                            'email': user_data['email']['value'],
                            'nom': user_data['nom']['value']
                        }
                    })
                else:
                    return JsonResponse({
                        'status': 'error',
                        'message': 'Identifiants incorrects'
                    }, status=401)
            else:
                return JsonResponse({
                    'status': 'error',
                    'message': result['message']
                }, status=500)
                
        except json.JSONDecodeError:
            return JsonResponse({
                'status': 'error',
                'message': 'Données JSON invalides'
            }, status=400)
        except Exception as e:
            print("❌ Erreur login:", e)
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=500)