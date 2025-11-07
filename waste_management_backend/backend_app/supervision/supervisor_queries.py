# backend_app/supervision/supervisor_queries.py
from SPARQLWrapper import SPARQLWrapper, JSON, POST
import os
import uuid

# Configuration Fuseki
FUSEKI_URL = os.environ.get("SPARQL_ENDPOINT")

def get_all_supervisors():
    """Récupère tous les superviseurs avec leurs détails"""
    try:
        sparql = SPARQLWrapper(FUSEKI_URL + "/query")
        query = """
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX owl: <http://www.w3.org/2002/07/owl#>
        PREFIX onto: <http://www.semanticweb.org/wiemb/ontologies/2025/8/untitled-ontology-2#>
        
        SELECT DISTINCT ?supervisor ?id ?nomComplet ?type ?fonction ?email ?telephone ?zoneAffectation ?actif WHERE {
            # Chercher toutes les instances de Superviseur OU de ses sous-classes
            {
                ?supervisor a onto:Superviseur .
            }
            UNION
            {
                ?supervisor a ?subclass .
                ?subclass rdfs:subClassOf onto:Superviseur .
            }
            UNION
            {
                # Chercher aussi directement les sous-classes spécifiques
                ?supervisor a onto:Superviseur_Environnemental .
            }
            UNION
            {
                ?supervisor a onto:Superviseur_Municipal .
            }
            UNION
            {
                ?supervisor a onto:Superviseur_National .
            }
            UNION
            {
                ?supervisor a onto:Superviseur_Regional .
            }
            UNION
            {
                ?supervisor a onto:Superviseur_Securite .
            }
            UNION
            {
                ?supervisor a onto:Supervuseur_Qualite .
            }
            
            # Récupérer nomComplet (obligatoire pour identifier un superviseur)
            ?supervisor onto:nomComplet ?nomComplet .
            
            # Récupérer l'ID - peut être idSuperviseur ou idCentre (pour certains superviseurs)
            OPTIONAL { ?supervisor onto:idSuperviseur ?idSuperviseur }
            OPTIONAL { ?supervisor onto:idCentre ?idCentre }
            # Utiliser idSuperviseur si disponible, sinon idCentre, sinon l'URI
            BIND(COALESCE(?idSuperviseur, ?idCentre, REPLACE(STR(?supervisor), "^.*#", "")) AS ?id)
            
            OPTIONAL { ?supervisor onto:fonction ?fonction }
            OPTIONAL { ?supervisor onto:email ?email }
            OPTIONAL { ?supervisor onto:telephone ?telephone }
            OPTIONAL { ?supervisor onto:zoneAffectation ?zoneAffectation }
            # Récupérer actif (true ou false) - OPTIONAL pour récupérer tous les superviseurs
            OPTIONAL { ?supervisor onto:actif ?actif }
            
            # Récupérer le type spécifique (la classe réelle la plus spécifique)
            ?supervisor a ?type .
            FILTER(?type != onto:Superviseur)
            FILTER(STRSTARTS(STR(?type), STR(onto:)))
            # S'assurer qu'on prend le type le plus spécifique (pas une super-classe)
            FILTER NOT EXISTS {
                ?supervisor a ?moreSpecific .
                ?moreSpecific rdfs:subClassOf ?type .
                FILTER(?moreSpecific != ?type)
                FILTER(STRSTARTS(STR(?moreSpecific), STR(onto:)))
            }
        }
        ORDER BY ?nomComplet
        """
        sparql.setQuery(query)
        sparql.setReturnFormat(JSON)
        results = sparql.query().convert()
        return {"status": "success", "data": results}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def get_supervisors_by_type(supervisor_type):
    """Récupère les superviseurs par type spécifique"""
    try:
        sparql = SPARQLWrapper(FUSEKI_URL + "/query")
        
        # Mapping des types pour faciliter l'utilisation
        type_mapping = {
            "environnemental": "onto:Superviseur_Environemenetal",
            "municipal": "onto:Superviseur_Municipal", 
            "national": "onto:Superviseur_National",
            "regional": "onto:Superviseur_Regional",
            "securite": "onto:Superviseur_Securite",
            "qualite": "onto:Supervuseur_Qualite"
        }
        
        supervisor_class = type_mapping.get(supervisor_type.lower(), "onto:Superviseur")
        
        query = f"""
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX owl: <http://www.w3.org/2002/07/owl#>
        PREFIX onto: <http://www.semanticweb.org/wiemb/ontologies/2025/8/untitled-ontology-2#>
        
        SELECT ?supervisor ?id ?nomComplet ?fonction ?email ?telephone ?zoneAffectation ?actif WHERE {{
            ?supervisor a {supervisor_class} .
            ?supervisor onto:idSuperviseur ?id .
            ?supervisor onto:nomComplet ?nomComplet .
            OPTIONAL {{ ?supervisor onto:fonction ?fonction }}
            OPTIONAL {{ ?supervisor onto:email ?email }}
            OPTIONAL {{ ?supervisor onto:telephone ?telephone }}
            OPTIONAL {{ ?supervisor onto:zoneAffectation ?zoneAffectation }}
            OPTIONAL {{ ?supervisor onto:actif ?actif }}
        }}
        ORDER BY ?nomComplet
        """
        sparql.setQuery(query)
        sparql.setReturnFormat(JSON)
        results = sparql.query().convert()
        return {"status": "success", "data": results}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def get_supervisor_centers(supervisor_uri):
    """Récupère les centres de traitement assignés à un superviseur"""
    try:
        print(f"DEBUG - Récupération des centres pour le superviseur: {supervisor_uri}")
        sparql = SPARQLWrapper(FUSEKI_URL + "/query")
        query = f"""
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX owl: <http://www.w3.org/2002/07/owl#>
        PREFIX onto: <http://www.semanticweb.org/wiemb/ontologies/2025/8/untitled-ontology-2#>
        
        SELECT ?center ?id ?nomCentre ?typeCentre ?statutOperationnel ?horairesOuverture ?adresse ?type WHERE {{
            <{supervisor_uri}> onto:affecteA ?center .
            OPTIONAL {{ ?center onto:idCentre ?idCentre }}
            OPTIONAL {{ ?center onto:nomCentre ?nomCentre }}
            OPTIONAL {{ ?center onto:typeCentre ?typeCentre }}
            OPTIONAL {{ ?center onto:statutOperationnel ?statutOperationnel }}
            OPTIONAL {{ ?center onto:horairesOuverture ?horairesOuverture }}
            OPTIONAL {{ ?center onto:adresse ?adresse }}
            
            # Utiliser idCentre si disponible, sinon l'URI comme ID
            BIND(COALESCE(?idCentre, REPLACE(STR(?center), "^.*#", "")) AS ?id)
            
            # Récupérer le type spécifique du centre (le plus spécifique)
            ?center a ?type .
            FILTER(STRSTARTS(STR(?type), STR(onto:)))
            FILTER(?type != onto:Centre_traitement)
            FILTER(?type != onto:Acteur)
            # S'assurer qu'on prend le type le plus spécifique (pas une super-classe)
            FILTER NOT EXISTS {{
                ?center a ?moreSpecific .
                ?moreSpecific rdfs:subClassOf ?type .
                FILTER(?moreSpecific != ?type)
                FILTER(STRSTARTS(STR(?moreSpecific), STR(onto:)))
            }}
        }}
        ORDER BY ?nomCentre
        """
        sparql.setQuery(query)
        sparql.setReturnFormat(JSON)
        results = sparql.query().convert()
        
        # Debug: imprimer le nombre de centres trouvés
        bindings = results.get('results', {}).get('bindings', [])
        print(f"DEBUG - Nombre de centres trouvés pour {supervisor_uri}: {len(bindings)}")
        if len(bindings) == 0:
            print(f"DEBUG - Requête SELECT pour les centres:")
            print(query)
        
        return {"status": "success", "data": results}
    except Exception as e:
        print(f"DEBUG - Erreur lors de la récupération des centres: {str(e)}")
        return {"status": "error", "message": str(e)}

def get_supervisors_statistics():
    """Récupère des statistiques sur les superviseurs"""
    try:
        sparql = SPARQLWrapper(FUSEKI_URL + "/query")
        query = """
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX owl: <http://www.w3.org/2002/07/owl#>
        PREFIX onto: <http://www.semanticweb.org/wiemb/ontologies/2025/8/untitled-ontology-2#>
        
        SELECT 
            (COUNT(DISTINCT ?supervisor) AS ?totalSupervisors)
            (COUNT(DISTINCT ?environnemental) AS ?environnementalSupervisors)
            (COUNT(DISTINCT ?municipal) AS ?municipalSupervisors) 
            (COUNT(DISTINCT ?national) AS ?nationalSupervisors)
            (COUNT(DISTINCT ?regional) AS ?regionalSupervisors)
            (COUNT(DISTINCT ?securite) AS ?securiteSupervisors)
            (COUNT(DISTINCT ?qualite) AS ?qualiteSupervisors)
            (COUNT(DISTINCT ?actif) AS ?activeSupervisors)
        WHERE {
            { ?supervisor a onto:Superviseur }
            UNION
            { ?environnemental a onto:Superviseur_Environemenetal }
            UNION  
            { ?municipal a onto:Superviseur_Municipal }
            UNION
            { ?national a onto:Superviseur_National }
            UNION
            { ?regional a onto:Superviseur_Regional }
            UNION
            { ?securite a onto:Superviseur_Securite }
            UNION
            { ?qualite a onto:Supervuseur_Qualite }
            UNION
            { 
                ?supervisor onto:actif ?actif .
                FILTER(?actif = true)
            }
        }
        """
        sparql.setQuery(query)
        sparql.setReturnFormat(JSON)
        results = sparql.query().convert()
        return {"status": "success", "data": results}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def search_supervisors(search_term):
    """Recherche de superviseurs par terme"""
    try:
        sparql = SPARQLWrapper(FUSEKI_URL + "/query")
        query = f"""
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX owl: <http://www.w3.org/2002/07/owl#>
        PREFIX onto: <http://www.semanticweb.org/wiemb/ontologies/2025/8/untitled-ontology-2#>
        
        SELECT ?supervisor ?id ?nomComplet ?type ?fonction ?email ?telephone WHERE {{
            ?supervisor a onto:Superviseur .
            ?supervisor onto:idSuperviseur ?id .
            ?supervisor onto:nomComplet ?nomComplet .
            OPTIONAL {{ ?supervisor onto:fonction ?fonction }}
            OPTIONAL {{ ?supervisor onto:email ?email }}
            OPTIONAL {{ ?supervisor onto:telephone ?telephone }}
            
            FILTER(REGEX(LCASE(STR(?nomComplet)), LCASE("{search_term}")) || 
                   REGEX(LCASE(STR(?fonction)), LCASE("{search_term}")) ||
                   REGEX(LCASE(STR(?email)), LCASE("{search_term}")))
            
            # Récupérer le type spécifique
            OPTIONAL {{
                ?supervisor a ?type .
                FILTER(?type != onto:Superviseur)
                FILTER(STRSTARTS(STR(?type), STR(onto:)))
            }}
        }}
        ORDER BY ?nomComplet
        LIMIT 50
        """
        sparql.setQuery(query)
        sparql.setReturnFormat(JSON)
        results = sparql.query().convert()
        return {"status": "success", "data": results}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def get_supervisor_details(supervisor_uri):
    """Récupère les détails complets d'un superviseur spécifique"""
    try:
        sparql = SPARQLWrapper(FUSEKI_URL + "/query")
        query = f"""
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX owl: <http://www.w3.org/2002/07/owl#>
        PREFIX onto: <http://www.semanticweb.org/wiemb/ontologies/2025/8/untitled-ontology-2#>
        
        SELECT ?property ?value WHERE {{
            <{supervisor_uri}> ?property ?value .
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

def add_supervisor(nom_complet, supervisor_type, email=None, telephone=None, fonction=None, zone_affectation=None, actif=True, id_superviseur=None, center_uri=None):
    """Ajoute un nouveau superviseur dans l'ontologie"""
    try:
        # Fonction pour échapper les guillemets dans les valeurs
        def escape_sparql_string(value):
            if value is None:
                return ""
            # Échapper les guillemets doubles et les backslashes
            return str(value).replace("\\", "\\\\").replace('"', '\\"')
        
        # Générer un ID unique si non fourni
        if not id_superviseur:
            id_superviseur = str(uuid.uuid4())
        
        # Créer l'URI du superviseur basé sur le type et le nom
        # Nettoyer le nom pour créer un identifiant valide (supprimer les caractères spéciaux)
        import re
        supervisor_name_clean = re.sub(r'[^a-zA-Z0-9_]', '_', nom_complet)
        # Supprimer les underscores multiples
        supervisor_name_clean = re.sub(r'_+', '_', supervisor_name_clean)
        # Supprimer les underscores au début et à la fin
        supervisor_name_clean = supervisor_name_clean.strip('_')
        # Capitaliser la première lettre pour correspondre au format Protégé
        if supervisor_name_clean:
            supervisor_name_clean = supervisor_name_clean[0].upper() + supervisor_name_clean[1:] if len(supervisor_name_clean) > 1 else supervisor_name_clean.upper()
        
        supervisor_uri = f"http://www.semanticweb.org/wiemb/ontologies/2025/8/untitled-ontology-2#{supervisor_type}_{supervisor_name_clean}"
        
        # Construire la requête SPARQL INSERT
        insert_parts = []
        
        # Type du superviseur
        insert_parts.append(f"<{supervisor_uri}> a onto:{supervisor_type} .")
        
        # Propriétés obligatoires (échapper les valeurs)
        nom_complet_escaped = escape_sparql_string(nom_complet)
        id_superviseur_escaped = escape_sparql_string(id_superviseur)
        insert_parts.append(f'<{supervisor_uri}> onto:nomComplet "{nom_complet_escaped}" .')
        insert_parts.append(f'<{supervisor_uri}> onto:idSuperviseur "{id_superviseur_escaped}" .')
        
        # Propriétés optionnelles (échapper les valeurs)
        if email:
            email_escaped = escape_sparql_string(email)
            insert_parts.append(f'<{supervisor_uri}> onto:email "{email_escaped}" .')
        if telephone:
            telephone_escaped = escape_sparql_string(telephone)
            insert_parts.append(f'<{supervisor_uri}> onto:telephone "{telephone_escaped}" .')
        if fonction:
            fonction_escaped = escape_sparql_string(fonction)
            insert_parts.append(f'<{supervisor_uri}> onto:fonction "{fonction_escaped}" .')
        if zone_affectation:
            zone_affectation_escaped = escape_sparql_string(zone_affectation)
            insert_parts.append(f'<{supervisor_uri}> onto:zoneAffectation "{zone_affectation_escaped}" .')
        
        # Statut actif (booléen)
        actif_value = "true" if actif else "false"
        insert_parts.append(f'<{supervisor_uri}> onto:actif "{actif_value}"^^xsd:boolean .')
        
        # Relation avec le centre (si fourni)
        if center_uri:
            print(f"DEBUG - Ajout de la relation affecteA: {supervisor_uri} -> {center_uri}")
            insert_parts.append(f'<{supervisor_uri}> onto:affecteA <{center_uri}> .')
        else:
            print("DEBUG - Aucun centre fourni, relation affecteA non créée")
        
        # Construire la requête INSERT complète
        # Joindre les parties avec des sauts de ligne (chaque partie se termine déjà par un point)
        insert_query = "\n        ".join(insert_parts)
        
        query = f"""
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX owl: <http://www.w3.org/2002/07/owl#>
        PREFIX onto: <http://www.semanticweb.org/wiemb/ontologies/2025/8/untitled-ontology-2#>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        
        INSERT DATA {{
            {insert_query}
        }}
        """
        
        # Debug: imprimer la requête pour vérification
        print("DEBUG - Requête INSERT SPARQL:")
        print(query)
        
        # Exécuter la requête UPDATE
        sparql = SPARQLWrapper(FUSEKI_URL + "/update")
        sparql.setQuery(query)
        sparql.setMethod(POST)
        
        try:
            result = sparql.query()
            
            # Vérifier si la requête a réussi
            # Si result.response est None ou si le code de statut n'est pas 200, il y a une erreur
            if hasattr(result, 'response') and result.response:
                status_code = result.response.status
                if status_code != 200 and status_code != 204:
                    response_text = result.response.read().decode('utf-8') if hasattr(result.response, 'read') else ""
                    print(f"DEBUG - Erreur INSERT: Code {status_code}, Response: {response_text}")
                    return {
                        "status": "error",
                        "message": f"Erreur lors de l'insertion: Code {status_code}. {response_text}"
                    }
                else:
                    print(f"DEBUG - INSERT réussi: Code {status_code}")
        except Exception as update_error:
            print(f"DEBUG - Exception lors de l'INSERT: {str(update_error)}")
            raise update_error
        
        # Vérifier que le superviseur a bien été ajouté en le recherchant
        try:
            verify_query = f"""
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX onto: <http://www.semanticweb.org/wiemb/ontologies/2025/8/untitled-ontology-2#>
            
            ASK {{
                <{supervisor_uri}> a onto:{supervisor_type} .
                <{supervisor_uri}> onto:nomComplet "{nom_complet}" .
            }}
            """
            verify_sparql = SPARQLWrapper(FUSEKI_URL + "/query")
            verify_sparql.setQuery(verify_query)
            verify_sparql.setReturnFormat(JSON)
            verify_result = verify_sparql.query().convert()
            verified = verify_result.get('boolean', False)
            print(f"DEBUG - Vérification de l'ajout: {verified}")
            
            # Vérifier aussi la relation avec le centre si fourni
            if center_uri:
                verify_center_query = f"""
                PREFIX onto: <http://www.semanticweb.org/wiemb/ontologies/2025/8/untitled-ontology-2#>
                
                ASK {{
                    <{supervisor_uri}> onto:affecteA <{center_uri}> .
                }}
                """
                verify_center_sparql = SPARQLWrapper(FUSEKI_URL + "/query")
                verify_center_sparql.setQuery(verify_center_query)
                verify_center_sparql.setReturnFormat(JSON)
                verify_center_result = verify_center_sparql.query().convert()
                center_verified = verify_center_result.get('boolean', False)
                print(f"DEBUG - Vérification de la relation affecteA: {center_verified}")
        except Exception as verify_error:
            print(f"DEBUG - Erreur lors de la vérification: {str(verify_error)}")
            verified = True  # On assume que c'est OK si la vérification échoue
        
        return {
            "status": "success",
            "message": "Superviseur ajouté avec succès",
            "supervisor_uri": supervisor_uri,
            "supervisor_name": f"{supervisor_type}_{supervisor_name_clean}",
            "id_superviseur": id_superviseur,
            "verified": verified
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

def delete_supervisor(supervisor_uri):
    """Supprime un superviseur de l'ontologie"""
    try:
        print(f"DEBUG - Suppression du superviseur: {supervisor_uri}")
        
        # Construire la requête DELETE pour supprimer toutes les propriétés et relations du superviseur
        query = f"""
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX owl: <http://www.w3.org/2002/07/owl#>
        PREFIX onto: <http://www.semanticweb.org/wiemb/ontologies/2025/8/untitled-ontology-2#>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        
        DELETE {{
            <{supervisor_uri}> ?property ?value .
        }}
        WHERE {{
            <{supervisor_uri}> ?property ?value .
        }}
        """
        
        # Debug: imprimer la requête pour vérification
        print("DEBUG - Requête DELETE SPARQL:")
        print(query)
        
        # Exécuter la requête UPDATE
        sparql = SPARQLWrapper(FUSEKI_URL + "/update")
        sparql.setQuery(query)
        sparql.setMethod(POST)
        
        try:
            result = sparql.query()
            
            # Vérifier si la requête a réussi
            if hasattr(result, 'response') and result.response:
                status_code = result.response.status
                if status_code != 200 and status_code != 204:
                    response_text = result.response.read().decode('utf-8') if hasattr(result.response, 'read') else ""
                    print(f"DEBUG - Erreur DELETE: Code {status_code}, Response: {response_text}")
                    return {
                        "status": "error",
                        "message": f"Erreur lors de la suppression: Code {status_code}. {response_text}"
                    }
                else:
                    print(f"DEBUG - DELETE réussi: Code {status_code}")
        except Exception as delete_error:
            print(f"DEBUG - Exception lors du DELETE: {str(delete_error)}")
            raise delete_error
        
        # Vérifier que le superviseur a bien été supprimé
        try:
            verify_query = f"""
            PREFIX onto: <http://www.semanticweb.org/wiemb/ontologies/2025/8/untitled-ontology-2#>
            
            ASK {{
                <{supervisor_uri}> ?property ?value .
            }}
            """
            verify_sparql = SPARQLWrapper(FUSEKI_URL + "/query")
            verify_sparql.setQuery(verify_query)
            verify_sparql.setReturnFormat(JSON)
            verify_result = verify_sparql.query().convert()
            still_exists = verify_result.get('boolean', False)
            print(f"DEBUG - Vérification de la suppression: Le superviseur existe encore = {still_exists}")
            
            if still_exists:
                return {
                    "status": "error",
                    "message": "Le superviseur n'a pas été complètement supprimé"
                }
        except Exception as verify_error:
            print(f"DEBUG - Erreur lors de la vérification: {str(verify_error)}")
            # On assume que c'est OK si la vérification échoue (peut-être que le superviseur n'existe plus)
        
        return {
            "status": "success",
            "message": "Superviseur supprimé avec succès"
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

def update_supervisor(supervisor_uri, nom_complet=None, email=None, telephone=None, fonction=None, zone_affectation=None, actif=None, center_uri=None):
    """Met à jour un superviseur dans l'ontologie"""
    try:
        print(f"DEBUG - Mise à jour du superviseur: {supervisor_uri}")
        
        # Fonction pour échapper les guillemets dans les valeurs
        def escape_sparql_string(value):
            if value is None:
                return ""
            # Échapper les guillemets doubles et les backslashes
            return str(value).replace("\\", "\\\\").replace('"', '\\"')
        
        # Construire les parties DELETE et INSERT pour la mise à jour
        delete_parts = []
        insert_parts = []
        
        # Si on met à jour le nom complet
        if nom_complet is not None:
            nom_complet_escaped = escape_sparql_string(nom_complet)
            delete_parts.append(f'<{supervisor_uri}> onto:nomComplet ?oldNomComplet .')
            insert_parts.append(f'<{supervisor_uri}> onto:nomComplet "{nom_complet_escaped}" .')
        
        # Si on met à jour l'email
        if email is not None:
            if email == "":
                # Supprimer l'email si vide
                delete_parts.append(f'<{supervisor_uri}> onto:email ?oldEmail .')
            else:
                email_escaped = escape_sparql_string(email)
                delete_parts.append(f'<{supervisor_uri}> onto:email ?oldEmail .')
                insert_parts.append(f'<{supervisor_uri}> onto:email "{email_escaped}" .')
        
        # Si on met à jour le téléphone
        if telephone is not None:
            if telephone == "":
                # Supprimer le téléphone si vide
                delete_parts.append(f'<{supervisor_uri}> onto:telephone ?oldTelephone .')
            else:
                telephone_escaped = escape_sparql_string(telephone)
                delete_parts.append(f'<{supervisor_uri}> onto:telephone ?oldTelephone .')
                insert_parts.append(f'<{supervisor_uri}> onto:telephone "{telephone_escaped}" .')
        
        # Si on met à jour la fonction
        if fonction is not None:
            if fonction == "":
                # Supprimer la fonction si vide
                delete_parts.append(f'<{supervisor_uri}> onto:fonction ?oldFonction .')
            else:
                fonction_escaped = escape_sparql_string(fonction)
                delete_parts.append(f'<{supervisor_uri}> onto:fonction ?oldFonction .')
                insert_parts.append(f'<{supervisor_uri}> onto:fonction "{fonction_escaped}" .')
        
        # Si on met à jour la zone d'affectation
        if zone_affectation is not None:
            if zone_affectation == "":
                # Supprimer la zone d'affectation si vide
                delete_parts.append(f'<{supervisor_uri}> onto:zoneAffectation ?oldZoneAffectation .')
            else:
                zone_affectation_escaped = escape_sparql_string(zone_affectation)
                delete_parts.append(f'<{supervisor_uri}> onto:zoneAffectation ?oldZoneAffectation .')
                insert_parts.append(f'<{supervisor_uri}> onto:zoneAffectation "{zone_affectation_escaped}" .')
        
        # Si on met à jour le statut actif
        if actif is not None:
            actif_value = "true" if actif else "false"
            delete_parts.append(f'<{supervisor_uri}> onto:actif ?oldActif .')
            insert_parts.append(f'<{supervisor_uri}> onto:actif "{actif_value}"^^xsd:boolean .')
        
        # Si on met à jour la relation avec le centre
        if center_uri is not None:
            # Supprimer l'ancienne relation affecteA
            delete_parts.append(f'<{supervisor_uri}> onto:affecteA ?oldCenter .')
            # Ajouter la nouvelle relation si un centre est fourni
            if center_uri != "":
                insert_parts.append(f'<{supervisor_uri}> onto:affecteA <{center_uri}> .')
        
        # Si aucune mise à jour n'est demandée
        if not delete_parts and not insert_parts:
            return {
                "status": "error",
                "message": "Aucune mise à jour demandée"
            }
        
        # Construire la requête DELETE/INSERT
        delete_clause = "\n        ".join(delete_parts) if delete_parts else ""
        insert_clause = "\n        ".join(insert_parts) if insert_parts else ""
        
        query = f"""
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX owl: <http://www.w3.org/2002/07/owl#>
        PREFIX onto: <http://www.semanticweb.org/wiemb/ontologies/2025/8/untitled-ontology-2#>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        
        DELETE {{
            {delete_clause}
        }}
        INSERT {{
            {insert_clause}
        }}
        WHERE {{
            {delete_clause}
        }}
        """
        
        # Debug: imprimer la requête pour vérification
        print("DEBUG - Requête UPDATE SPARQL:")
        print(query)
        
        # Exécuter la requête UPDATE
        sparql = SPARQLWrapper(FUSEKI_URL + "/update")
        sparql.setQuery(query)
        sparql.setMethod(POST)
        
        try:
            result = sparql.query()
            
            # Vérifier si la requête a réussi
            if hasattr(result, 'response') and result.response:
                status_code = result.response.status
                if status_code != 200 and status_code != 204:
                    response_text = result.response.read().decode('utf-8') if hasattr(result.response, 'read') else ""
                    print(f"DEBUG - Erreur UPDATE: Code {status_code}, Response: {response_text}")
                    return {
                        "status": "error",
                        "message": f"Erreur lors de la mise à jour: Code {status_code}. {response_text}"
                    }
                else:
                    print(f"DEBUG - UPDATE réussi: Code {status_code}")
        except Exception as update_error:
            print(f"DEBUG - Exception lors de l'UPDATE: {str(update_error)}")
            raise update_error
        
        return {
            "status": "success",
            "message": "Superviseur mis à jour avec succès"
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

