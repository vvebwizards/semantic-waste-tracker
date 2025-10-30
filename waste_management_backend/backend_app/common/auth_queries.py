import hashlib
from datetime import datetime

class AuthQueries:
    PREFIXES = """
    PREFIX waste: <http://www.semanticweb.org/wiemb/ontologies/2025/8/untitled-ontology-2#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    """
    
    @staticmethod
    def hash_password(password):
        """Hash un mot de passe"""
        return hashlib.sha256(password.encode()).hexdigest()
    
    @staticmethod
    def register_user(user_id, username, password, email, role, sous_role, nom="", adresse="", ville="", code_postal=""):
        """Enregistre avec rôle principal ET sous-rôle"""
        password_hash = AuthQueries.hash_password(password)
        current_time = datetime.now().isoformat()
        
        return f"""
        {AuthQueries.PREFIXES}
        INSERT DATA {{
            waste:{user_id} rdf:type waste:{role} ;           # ← ROLE PRINCIPAL
                        waste:sousRole "{sous_role}" ;     # ← NOUVEAU : Stocke le sous-rôle
                        waste:username "{username}" ;
                        waste:mdp "{password_hash}" ;
                        waste:email "{email}" ;
                        waste:created_at "{current_time}"^^xsd:dateTime ;
                        waste:nom "{nom}" ;
                        waste:adresse "{adresse}" ;
                        waste:ville "{ville}" ;
                        waste:codePostal "{code_postal}" .
        }}
        """
    
    @staticmethod
    def login_user(username, password):
        """Retourne rôle principal ET sous-rôle"""
        password_hash = AuthQueries.hash_password(password)
        
        return f"""
        {AuthQueries.PREFIXES}
        SELECT ?user ?role ?sous_role ?email ?nom WHERE {{
            ?user waste:username "{username}" ;
                waste:mdp "{password_hash}" ;
                waste:email ?email ;
                waste:nom ?nom ;
                waste:sousRole ?sous_role ;          # ← Récupère le sous-rôle
                waste:created_at ?createdAt .
            
            # Trouve le rôle principal (via rdf:type)
            ?user rdf:type ?role .
            FILTER(STRSTARTS(STR(?role), "http://www.semanticweb.org/wiemb/ontologies/2025/8/untitled-ontology-2#"))
        }}
        """
    
    @staticmethod
    def check_username_exists(username):
        """Vérifie si un username existe déjà"""
        return f"""
        {AuthQueries.PREFIXES}
        ASK {{
            ?user waste:username "{username}" .
        }}
        """

