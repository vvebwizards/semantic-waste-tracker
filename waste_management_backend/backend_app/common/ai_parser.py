import re
import spacy
import requests
from spacy.matcher import Matcher
from sentence_transformers import SentenceTransformer, util
import os
from dotenv import load_dotenv

load_dotenv()

nlp = spacy.load("fr_core_news_sm")
model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")

ontology_terms = ["nom", "codePostal", "adresse", "email", "ville", "username", "mdp", "created_at"]
ontology_embeddings = model.encode(ontology_terms, convert_to_tensor=True)


SPARQL_ENDPOINT = os.environ.get("SPARQL_ENDPOINT")

def get_dynamic_attributes():
    try:
        query = """
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        SELECT DISTINCT ?attr WHERE { ?attr a rdf:Property. }
        """
        response = requests.post(SPARQL_ENDPOINT, data={"query": query},
                                 headers={"Accept": "application/sparql-results+json"})
        results = response.json()["results"]["bindings"]
        return [r["attr"]["value"].split("#")[-1].lower() for r in results]
    except:
        return ontology_terms

DYNAMIC_ATTRS = get_dynamic_attributes()


CLASSES = [
    "Producteur", "Producteur_Industriel", "Producteur_Agricole", "Producteur_Commercial",
    "Producteur_Hospitalier", "Producteur_Residentiel",
    "Dechet_Metal", "Dechet_Papier", "Dechets", "Dechets_Chimiques", "Dechets_Dangereux",
    "Dechets_Electronique", "Dechets_Medicaux", "Dechets_Organique", "Dechets_Plastique",
    "Dechets_Textile", "Dechets_Volumineux", "Dechets_verre",
    "Superviseur", "Superviseur_Regional", "Superviseur_National", "Superviseur_Municipal",
    "Superviseur_Environemenetal", "Superviseur_Securite", "Supervuseur_Qualite",
    "Centre_traitement", "Centre_compostage", "Centre_tri", "Usine_recyclage",
    "Centre_Compostage_Collectif", "Centre_Compostage_Individuel", "Centre_Compostage_Industriel",
    "Centre_Tri_Automatise", "Centre_Tri_Densite", "Centre_Tri_Magnetique", "Centre_Tri_Manuel",
    "Centre_Tri_Mixte", "Centre_Tri_Optique",
    "Usine_Recyclage_Batteries", "Usine_Recyclage_Bois", "Usine_Recyclage_Electronique",
    "Usine_Recyclage_Metal", "Usine_Recyclage_Plastique", "Usine_Recyclage_Textile", "Usine_Recyclage_Verre",
    "Transporteur", "Transporteur_Camion-benne", "Transporteur_Camion-grue", "Transporteur_spécialisé",
    "Collecteur", "Collecteur_Conteneur", "Collecteur_Municipal", "Collecteur_Prive",
    "Centre_traitement", "Centre_compostage", "Centre_tri", 
    "Centre_Compostage_Collectif", "Centre_Compostage_Individuel", "Centre_Compostage_Industriel",
    "Centre_Tri_Automatise", "Centre_Tri_Densite", "Centre_Tri_Magnetique", "Centre_Tri_Manuel",
    "Centre_Tri_Mixte", "Centre_Tri_Optique",
    "Dechets_Organique", "Dechets_Plastique", "Dechets_Metal", "Dechets_Papier", "Dechets_Textile"
]

CLASS_KEYWORDS = {
    "Producteur_Industriel": ["industriel", "usine", "industrie", "manufacture", "producteurs industriels", "producteur industriel", "usines"],
    "Producteur_Agricole": ["ferme", "agricole", "agriculteur", "producteurs agricoles", "producteur agricole", "agriculteurs", "fermes"],
    "Producteur_Commercial": ["commerce", "commercial", "magasin", "entreprise", "commerçant", "commerces"],
    "Producteur_Hospitalier": ["hospitalier", "hôpital", "hopital", "clinique", "médical", "hôpitaux"],
    "Producteur_Residentiel": ["résidentiel", "domicile", "ménage", "habitation", "résident", "ménages", "résidents"],
    "Dechet_Metal": ["métal", "cuivre", "ferraille", "métallique", "déchets métalliques", "métaux"],
    "Dechet_Papier": ["papier", "carton", "déchets papier", "papiers", "cartons"],
    "Dechets_Organique": ["organique", "restes alimentaires", "déchets alimentaires", "biologique", "organiques"],
    "Dechets_Plastique": ["plastique", "emballage plastique", "déchets plastiques", "plastiques"],
    "Dechets_Textile": ["textile", "vêtement", "linge", "déchets textiles", "textiles", "vêtements"],
    "Dechets_Chimiques": ["chimiques", "déchets chimiques", "produits chimiques"],
    "Dechets_Electronique": ["électronique", "electronique", "déchets électroniques", "appareils électroniques", "électroniques"],
    "Superviseur_Regional": ["superviseur régional", "superviseur regional", "superviseurs régionaux", "supervision régionale"],
    "Superviseur_National": ["superviseur national", "superviseurs nationaux", "supervision nationale"],
    "Superviseur_Municipal": ["superviseur municipal", "superviseurs municipaux", "supervision municipale"],
    "Superviseur_Environemenetal": ["superviseur environnemental", "superviseur environnement", "superviseurs environnementaux", "supervision environnementale"],
    "Superviseur_Securite": ["superviseur sécurité", "superviseur securite", "superviseurs sécurité", "supervision sécurité", "superviseur de sécurité"],
    "Supervuseur_Qualite": ["superviseur qualité", "superviseur qualite", "superviseurs qualité", "supervision qualité", "superviseur de qualité"],
    "Centre_compostage": ["centre compostage", "centres compostage", "compostage", "centre de compostage"],
    "Centre_tri": ["centre tri", "centres tri", "tri", "centre de tri", "centres de tri"],
    "Usine_recyclage": ["usine recyclage", "usines recyclage", "recyclage", "usine de recyclage", "usines de recyclage"],
    "Centre_Compostage_Collectif": ["compostage collectif", "centre compostage collectif"],
    "Centre_Compostage_Individuel": ["compostage individuel", "centre compostage individuel"],
    "Centre_Compostage_Industriel": ["compostage industriel", "centre compostage industriel"],
    "Centre_Tri_Automatise": ["tri automatisé", "tri automatise", "centre tri automatisé", "centre tri automatise"],
    "Centre_Tri_Manuel": ["tri manuel", "centre tri manuel", "centres tri manuel"],
    "Centre_Tri_Optique": ["tri optique", "centre tri optique", "centres tri optique"],
    "Usine_Recyclage_Plastique": ["recyclage plastique", "usine recyclage plastique", "recyclage des plastiques"],
    "Usine_Recyclage_Metal": ["recyclage métal", "recyclage metal", "usine recyclage métal", "recyclage des métaux"],
    "Usine_Recyclage_Verre": ["recyclage verre", "usine recyclage verre", "recyclage du verre"],
    "Usine_Recyclage_Batteries": ["recyclage batteries", "usine recyclage batteries", "recyclage des batteries"],
    "Usine_Recyclage_Electronique": ["recyclage électronique", "recyclage electronique", "usine recyclage électronique", "recyclage des déchets électroniques"],
    "Transporteur_Camion-benne": ["transporteur camion-benne", "camion-benne", "camion benne", "transporteur camion benne"],
    "Transporteur_Camion-grue": ["transporteur camion-grue", "camion-grue", "camion grue", "transporteur camion grue"],
    "Transporteur_spécialisé": ["transporteur spécialisé", "transporteur specialise", "transporteur spécialisé déchets", "transporteur spécialisé dangereux"],
    "Collecteur_Conteneur": ["collecteur conteneur", "collecte conteneur", "collecteur à conteneur"],
    "Collecteur_Municipal": ["collecteur municipal", "collecte municipale", "collecteur municipal", "collecte municipale"],
    "Collecteur_Prive": ["collecteur privé", "collecteur prive", "collecte privée", "collecte privee"],
        "Centre_compostage": ["centre compostage", "centres compostage", "compostage", "centre de compostage", "composteur"],
    "Centre_tri": ["centre tri", "centres tri", "tri", "centre de tri", "centres de tri", "unité tri"],
    "Centre_Compostage_Collectif": ["compostage collectif", "centre compostage collectif", "composteur collectif"],
    "Centre_Compostage_Industriel": ["compostage industriel", "centre compostage industriel", "composteur industriel"],
    "Centre_Tri_Automatise": ["tri automatisé", "tri automatise", "centre tri automatisé", "tri automatique"],
    "Centre_Tri_Manuel": ["tri manuel", "centre tri manuel", "tri à la main"],
    "Centre_Tri_Optique": ["tri optique", "centre tri optique", "tri par caméra"],
    "Centre_Tri_Magnetique": ["tri magnétique", "tri magnetique", "aimant", "séparation magnétique"],
    "Dechets_Organique": ["organique", "restes alimentaires", "déchets alimentaires", "biologique", "compostable", "biodéchet"],
    "Dechets_Plastique": ["plastique", "emballage plastique", "déchets plastiques", "bouteille plastique"],
    "Dechets_Metal": ["métal", "ferraille", "canette", "boîte conserve", "déchets métalliques"],
    "Dechets_Papier": ["papier", "carton", "journal", "emballage carton"]
}


matcher = Matcher(nlp.vocab)

for label, keywords in CLASS_KEYWORDS.items():
    patterns = []
    for kw in keywords:
        
        if " " in kw:
            pattern = [{"LOWER": token.lower()} for token in kw.split()]
            patterns.append(pattern)
        
        else:
            pattern = [{"LOWER": kw.lower()}]
            patterns.append(pattern)
    
    if patterns:
        matcher.add(label, patterns)


def detect_attribute(question: str):
    attrs = []
    doc = nlp(question.lower())

    patterns = {
        "nom": [
            r'\bnom\s+(?:est|a pour|:)\s*["«]?([^"»\n]+)["»]?',
            r'\bappel[ée]\s+([^"\n]+)',
            r'\bnomm[ée]\s+([^"\n]+)',
            r'\ba pour nom\s+([^"\n]+)'
        ],
        "codePostal": [
            r'\bcode\s+postal\s+(\d+)',
            r'\bcp\s+(\d+)',
            r'\bpostal\s+(\d+)',
            r'\bavec\s+codePostal\s+(\d+)',
            r'\bcodePostal\s+(\d+)'
        ],
        "ville": [
            r'\bdans\s+la\s+ville\s+(?:de\s+)?([A-ZÉÈÀ][a-zéèàêôûç\-]+)',
            r'\bville\s+(?:de\s+)?([A-ZÉÈÀ][a-zéèàêôûç\-]+)',
            r'\bà\s+(?!un\b|une\b|le\b|la\b|les\b|des\b|du\b|de\b)([A-ZÉÈÀ][a-zéèàêôûç\-]+)(?:\s|$|,)',
            r'\ba\s+(?!un\b|une\b|le\b|la\b|les\b|des\b|du\b|de\b)([A-ZÉÈÀ][a-zéèàêôûç\-]+)(?:\s|$|,)'
        ],
        "adresse": [
            r'\badresse\s+([\w\s\-\d,]+)'
        ],
        "codeMatiere": [
            r'\bcode\s+mati[èe]re\s+([\w\-]+)',
            r'\bmati[èe]re\s+([\w\-]+)'
        ],
        "nomCentre": [
            r'\b(?:quel|le|un)\s+centre\s+(?:a pour nom|nommé|appelé|:)\s*["«]?([^"»\n?]+?)(?:\?|$|["»])',
            r'\bcentre\s+(?:a pour nom|nommé|appelé|:)\s*["«]?([^"»\n?]+?)(?:\?|$|["»])',
            r'\bnomCentre\s+["«]?([^"»\n]+)["»]?'
        ],
        "nomComplet": [
            r'\bnom\s+complet\s+(?:est|:)\s*["«]?([^"»\n]+)["»]?',
            r'\bsuperviseur\s+["«]?([^"»\n]+)["»]?',
            r'\bnomComplet\s+["«]?([^"»\n]+)["»]?'
        ],
        "statutOperationnel": [
            r'\bstatut\s+(?:est|:)\s*["«]?([^"»\n]+)["»]?',
            r'\bstatut\s+opérationnel\s+(?:est|:)\s*["«]?([^"»\n]+)["»]?',
            r'\b(en_service|maintenance|suspendu|fermé)',
            r'\bstatutOperationnel\s+["«]?([^"»\n]+)["»]?'
        ],
        "fonction": [
            r'\bfonction\s+(?:est|:)\s*["«]?([^"»\n]+)["»]?',
            r'\bfonction\s+["«]?([^"»\n]+)["»]?'
        ],
        "typeCentre": [
            r'\btype\s+(?:de\s+)?centre\s+(?:est|:)\s*["«]?([^"»\n]+)["»]?',
            r'\btype\s+centre\s+["«]?([^"»\n]+)["»]?',
            r'\btypeCentre\s+["«]?([^"»\n]+)["»]?'
        ],
        "email": [
            r'\bemail\s+(?:est|:)\s*["«]?([^"»\n]+)["»]?',
            r'\bemail\s+["«]?([\w@\.\-]+)["»]?'
        ],
        "telephone": [
            r'\btéléphone\s+(?:est|:)\s*["«]?([^"»\n]+)["»]?',
            r'\btelephone\s+(?:est|:)\s*["«]?([^"»\n]+)["»]?',
            r'\btel\s+(?:est|:)\s*["«]?([^"»\n]+)["»]?'
        ],
        "zoneAffectation": [
            r'\bzone\s+d[\'"]?affectation\s+(?:est|:)\s*["«]?([^"»\n]+)["»]?',
            r'\bzone\s+affectation\s+["«]?([^"»\n]+)["»]?',
            r'\bzoneAffectation\s+["«]?([^"»\n]+)["»]?'
        ],
        "actif": [
            r'\bactifs?\b',
            r'\bactif\s+(?:est|:)\s*["«]?(true|false|vrai|faux|oui|non)["»]?',
            r'\bactif\s+["«]?(true|false|vrai|faux|oui|non)["»]?'
        ],
        "capciteCharge": [
            r'\bcapacité\s+charge\s+(?:est|:)\s*(\d+\.?\d*)',
            r'\bcapciteCharge\s+(?:est|:)\s*(\d+\.?\d*)',
            r'\bcapacité\s+charge\s+["«]?(\d+\.?\d*)["»]?'
        ],
        "dateDernierControle": [
            r'\bdate\s+dernier\s+contrôle\s+(?:est|:)\s*([\d\-T:]+)',
            r'\bdate\s+dernier\s+controle\s+(?:est|:)\s*([\d\-T:]+)',
            r'\bdateDernierControle\s+(?:est|:)\s*([\d\-T:]+)'
        ],
        "estCertifie": [
            r'\bcertifi[ée]s?\b',
            r'\bestCertifie\s+(?:est|:)\s*["«]?(true|false|vrai|faux|oui|non)["»]?',
            r'\best\s+certifi[ée]\s+(?:est|:)\s*["«]?(true|false|vrai|faux|oui|non)["»]?'
        ],
        "idTransporteur": [
            r'\bid\s+transporteur\s+(?:est|:)\s*["«]?([\w\-]+)["»]?',
            r'\bidTransporteur\s+(?:est|:)\s*["«]?([\w\-]+)["»]?'
        ],
        "typeVehicule": [
            r'\btype\s+véhicule\s+(?:est|:)\s*["«]?([^"»\n]+)["»]?',
            r'\btype\s+vehicule\s+(?:est|:)\s*["«]?([^"»\n]+)["»]?',
            r'\btypeVehicule\s+(?:est|:)\s*["«]?([^"»\n]+)["»]?'
        ],
        "zoneIntervention": [
            r'\bzone\s+d[\'"]?intervention\s+(?:est|:)\s*["«]?([^"»\n]+)["»]?',
            r'\bzone\s+intervention\s+(?:est|:)\s*["«]?([^"»\n]+)["»]?',
            r'\bzoneIntervention\s+(?:est|:)\s*["«]?([^"»\n]+)["»]?'
        ],
        "dateAgrement": [
            r'\bdate\s+agrément\s+(?:est|:)\s*([\d\-T:]+)',
            r'\bdate\s+agrement\s+(?:est|:)\s*([\d\-T:]+)',
            r'\bdateAgrement\s+(?:est|:)\s*([\d\-T:]+)'
        ],
        "estAgree": [
            r'\bagr[ée]s?\b',
            r'\bestAgree\s+(?:est|:)\s*["«]?(true|false|vrai|faux|oui|non)["»]?',
            r'\best\s+agr[ée][ée]\s+(?:est|:)\s*["«]?(true|false|vrai|faux|oui|non)["»]?'
        ],
        "frequenceCollecte": [
            r'\bfr[ée]quence\s+collecte\s+(?:est|:)\s*["«]?([^"»\n]+)["»]?',
            r'\bfrequenceCollecte\s+(?:est|:)\s*["«]?([^"»\n]+)["»]?'
        ],
        "idCollecteur": [
            r'\bid\s+collecteur\s+(?:est|:)\s*["«]?([\w\-]+)["»]?',
            r'\bidCollecteur\s+(?:est|:)\s*["«]?([\w\-]+)["»]?'
        ],
        "typeCollecte": [
            r'\btype\s+collecte\s+(?:est|:)\s*["«]?([^"»\n]+)["»]?',
            r'\btypeCollecte\s+(?:est|:)\s*["«]?([^"»\n]+)["»]?'
        ],
        "zoneCouverture": [
            r'\bzone\s+de\s+couverture\s+(?:est|:)\s*["«]?([^"»\n]+)["»]?',
            r'\bzone\s+couverture\s+(?:est|:)\s*["«]?([^"»\n]+)["»]?',
            r'\bzoneCouverture\s+(?:est|:)\s*["«]?([^"»\n]+)["»]?'
        ],

         "capacite_journaliere": [
        r'capacit[ée]\s+(?:est|:)\s*(\d+\.?\d*)',
        r'capacit[ée]\s+journali[èe]re\s+(?:est|:)\s*(\d+\.?\d*)',
        r'peut traiter\s+(\d+\.?\d*)\s+tonnes',
        r'traite\s+(\d+\.?\d*)\s+tonnes'
    ],
    "debit_tri_heure": [
        r'd[ée]bit\s+(?:est|:)\s*(\d+\.?\d*)',
        r'd[ée]bit\s+tri\s+(?:est|:)\s*(\d+\.?\d*)',
        r'trie\s+(\d+\.?\d*)\s+tonnes\/heure',
        r'capacit[ée]\s+tri\s+(?:est|:)\s*(\d+\.?\d*)'
    ],
    "temps_compostage_jours": [
        r'temps\s+compostage\s+(?:est|:)\s*(\d+)',
        r'dur[ée]e\s+compostage\s+(?:est|:)\s*(\d+)',
        r'composte\s+en\s+(\d+)\s+jours',
        r'temps\s+n[ée]cessaire\s+(?:est|:)\s*(\d+)'
    ],
    "temperature_moyenne": [
        r'temp[ée]rature\s+(?:est|:)\s*(\d+\.?\d*)',
        r'temp[ée]rature\s+moyenne\s+(?:est|:)\s*(\d+\.?\d*)',
        r'chauffe[ à]\s+(\d+\.?\d*)\s+degr[ée]s'
    ],
    "taux_purete_sortie": [
        r'taux\s+puret[ée]\s+(?:est|:)\s*(\d+\.?\d*)',
        r'puret[ée]\s+sortie\s+(?:est|:)\s*(\d+\.?\d*)',
        r'qualit[ée]\s+tri\s+(?:est|:)\s*(\d+\.?\d*)%'
    ],
    "localisation": [
        r'[àa]\s+([A-ZÉÈÀ][a-zéèàêôûç\-]+)',
        r'dans\s+la\s+ville\s+(?:de\s+)?([A-ZÉÈÀ][a-zéèàêôûç\-]+)',
        r'localis[ée]\s+[àa]\s+([A-ZÉÈÀ][a-zéèàêôûç\-]+)',
        r'situ[ée]\s+[àa]\s+([A-ZÉÈÀ][a-zéèàêôûç\-]+)'
    ]
    }

    # First check for boolean attributes separately to avoid duplicates
    if re.search(r'\bactifs?\b', question, re.IGNORECASE):
        attrs.append({"name": "actif", "value": "true"})
    if re.search(r'\bcertifi[ée]s?\b', question, re.IGNORECASE):
        attrs.append({"name": "estCertifie", "value": "true"})
    if re.search(r'\bagr[ée]s?\b', question, re.IGNORECASE):
        attrs.append({"name": "estAgree", "value": "true"})
    
    # Check if question is about "centre" - if so, prioritize nomCentre over nom
    is_about_centre = "centre" in question.lower()
    
    # Then process other attributes
    for attr_name, pattern_list in patterns.items():
        if attr_name in ["actif", "estCertifie", "estAgree"]:
            continue  # Already handled above
        
        # Skip "nom" if we're talking about centres and will detect nomCentre
        if attr_name == "nom" and is_about_centre:
            continue
        
        for pattern in pattern_list:
            matches = re.finditer(pattern, question, re.IGNORECASE)
            for match in matches:
                if match.groups():
                    value = match.group(1).strip()
                    # Clean up value - remove trailing punctuation but keep the name
                    value = value.rstrip('?.,!;:')
                    if value and value.lower() not in ['pour', 'nom', 'est', 'a', 'dans', 'la', 'de', 'a pour nom']:
                        attrs.append({"name": attr_name, "value": value})

    
    # Remove duplicates and prioritize specific attributes
    unique_attrs = []
    seen = set()
    has_nomCentre = False
    nomCentre_value = None
    
    # First pass: identify nomCentre
    for attr in attrs:
        if attr['name'] == 'nomCentre':
            has_nomCentre = True
            nomCentre_value = attr['value']
            break
    
    # Second pass: add attributes, excluding nom if nomCentre exists
    for attr in attrs:
        attr_name = attr['name']
        attr_value = attr['value']
        
        # If we have nomCentre, skip nom with the same value
        if attr_name == "nom" and has_nomCentre and attr_value == nomCentre_value:
            continue
        
        key = (attr_name, attr_value)
        if key not in seen:
            seen.add(key)
            unique_attrs.append(attr)
    
    return unique_attrs


def detect_intent(question: str):
    """Detect higher-level intents for template queries.

    Currently recognizes recycling chain questions like:
    - "produit final" with "usine" or "recyclage"
    - mentions of produit + recycl*
    """
    q = question.lower()
    # robust to accents/variants by using partial stems
    has_produit_final = ("produit final" in q) or ("produits finaux" in q) or ("produitfinal" in q)
    has_recyclage = ("recycl" in q)  # matches recyclage / recyclé / recycler
    has_usine = ("usine" in q)
    if (has_produit_final and (has_usine or has_recyclage)) or ("usine de recyclage" in q and "produit" in q):
        return "recycling_chain"
    return None


RELATIONS = {
    "produit": ["produit", "produisent", "fabriquent", "génèrent", "créent", "manufacturent"],
    "affecteA": ["affecté à", "affecte à", "affecté au", "affecté à un", "affecté à une", "affectés à", "affectés à un", "affectés à une", "assigné à", "assigné au", "assignés à", "supervise le", "supervise la", "supervise un", "supervise une"],
    "audite": ["audite le", "audite la", "audite un", "audite une", "audit le", "audit la", "contrôle le", "contrôle la", "inspecte le", "inspecte la", "vérifie le", "vérifie la"],
    "régulé_par": ["régulé par", "réglementé par", "contrôlé par", "supervisé par"],
    "interagit_avec": ["interagit avec", "interagissent avec", "collabore avec", "collaborent avec"],
    "transporté_par": ["transporté par", "transporte par", "transportés par", "transportent par", "transporté", "transportée", "transportés", "transportées"],
    "collecté_par": ["collecté par", "collecte par", "collectés par", "collectent par", "collecté", "collectée", "collectés", "collectées"],
        "trie": ["trie", "trient", "sépare", "séparent", "classe", "classent", "triage"],
    "traite_par_compostage": ["traite par compostage", "composte", "compostent", "transforme en compost", "valorise organique"],
    "envoie_vers_compostage": ["envoie vers compostage", "envoie au compostage", "dirige vers compostage", "transfère vers compostage"],
    "accepte_pour_tri": ["accepte pour tri", "accepte au tri", "prend pour tri", "reçoit pour tri"]
}

def detect_relation(question: str):
    q_lower = question.lower()
    # Use word boundaries to avoid false positives
    import re
    for rel, keywords in RELATIONS.items():
        for kw in keywords:
            # Create a pattern with word boundaries to match whole words/phrases
            pattern = r'\b' + re.escape(kw) + r'\b'
            if re.search(pattern, q_lower):
                return rel
    return None


def extract_entities(question: str):
    doc = nlp(question)
    matches = matcher(doc)
    entities = {"classes": [], "relations": [], "attrs": []}

    found_classes = set()
    for match_id, start, end in matches:
        label = nlp.vocab.strings[match_id]
        found_classes.add(label)

    q_lower = question.lower()

    if "tous les producteurs" in q_lower or "liste des producteurs" in q_lower:
        found_classes.add("Producteur")
    if "tous les déchets" in q_lower or "liste des déchets" in q_lower:
        found_classes.add("Dechets")
    if "tous les superviseurs" in q_lower or "liste des superviseurs" in q_lower or "superviseurs" in q_lower:
        found_classes.add("Superviseur")
    if "tous les centres" in q_lower or "liste des centres" in q_lower or "centres de traitement" in q_lower:
        found_classes.add("Centre_traitement")
    if "centre" in q_lower and ("traitement" in q_lower or "compostage" in q_lower or "tri" in q_lower or "recyclage" in q_lower):
        if "compostage" in q_lower:
            found_classes.add("Centre_compostage")
        elif "tri" in q_lower:
            found_classes.add("Centre_tri")
        elif "recyclage" in q_lower:
            found_classes.add("Usine_recyclage")
        else:
            found_classes.add("Centre_traitement")
    if "tous les transporteurs" in q_lower or "liste des transporteurs" in q_lower or "transporteurs" in q_lower:
        found_classes.add("Transporteur")
    if "tous les collecteurs" in q_lower or "liste des collecteurs" in q_lower or "collecteurs" in q_lower:
        found_classes.add("Collecteur")

            # Détection spécifique pour tri et compostage
    if any(word in q_lower for word in ["tri", "trie", "triage"]):
        if "automat" in q_lower:
            found_classes.add("Centre_Tri_Automatise")
        elif "manuel" in q_lower:
            found_classes.add("Centre_Tri_Manuel")
        elif "optique" in q_lower:
            found_classes.add("Centre_Tri_Optique")
        elif "magnétique" in q_lower or "magnetique" in q_lower:
            found_classes.add("Centre_Tri_Magnetique")
        else:
            found_classes.add("Centre_tri")
    
    if any(word in q_lower for word in ["compost", "compostage"]):
        if "industriel" in q_lower:
            found_classes.add("Centre_Compostage_Industriel")
        elif "collectif" in q_lower:
            found_classes.add("Centre_Compostage_Collectif")
        elif "individuel" in q_lower:
            found_classes.add("Centre_Compostage_Individuel")
        else:
            found_classes.add("Centre_compostage")
    
    # Détection des déchets spécifiques
    if "organique" in q_lower or "compostable" in q_lower:
        found_classes.add("Dechets_Organique")
    if "plastique" in q_lower:
        found_classes.add("Dechets_Plastique")
    if "métal" in q_lower or "metal" in q_lower:
        found_classes.add("Dechets_Metal")
    if "papier" in q_lower or "carton" in q_lower:
        found_classes.add("Dechets_Papier")


    

    classes_list = list(found_classes)
    subject_classes = [cls for cls in classes_list if "Producteur" in cls or "Superviseur" in cls or "Transporteur" in cls or "Collecteur" in cls]
    object_classes = [cls for cls in classes_list if ("Dechet" in cls or "Dechets" in cls or "Centre" in cls or "Usine" in cls)]
    ordered_classes = subject_classes + object_classes
    entities["classes"] = ordered_classes

    # Only detect relation if there are both subject and object classes, or explicit relation words
    rel = detect_relation(question)
    if rel:
        # Only add relation if we have both subject and object classes, or if explicitly mentioned
        if subject_classes and object_classes:
            entities["relations"].append(rel)
        elif len(subject_classes) > 0 and len(object_classes) > 0:
            entities["relations"].append(rel)
        # Also add if explicitly asking about a relation (e.g., "qui affecte", "qui audite", "qui transporte", "qui collecte")
        elif any(word in question.lower() for word in ["qui affecte", "qui audite", "qui supervise", "qui transporte", "qui transportent", "qui collecte", "qui collectent", "affecté", "supervise", "audite", "transporté", "collecté"]):
            entities["relations"].append(rel)
    
    attrs = detect_attribute(question)
    if attrs:
        entities["attrs"] = attrs

    # High-level intent detection
    intent = detect_intent(question)
    if intent:
        entities["intent"] = intent

    return entities



def generate_sparql_from_entities(entities: dict) -> str:
    PREFIX = """PREFIX ex: <http://www.semanticweb.org/wiemb/ontologies/2025/8/untitled-ontology-2#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
"""

    # Template query for recycling chain intent
    if entities.get("intent") == "recycling_chain":
        query = f"""{PREFIX}SELECT * WHERE {{
  ?produit ex:nom ?produitNom ;
           ex:produit_par ?usine .
  ?centre ex:transfere_vers ?usine .
  ?dechet ex:recyclé_par ?centre ;
          ex:nom ?dechetNom .
}}"""
        return query

    classes = entities.get("classes", [])
    relations = entities.get("relations", [])
    attrs = entities.get("attrs", [])

    query_lines = []
    select_vars = ["?sujet"]

    subject_class = None
    object_class = None
    
    # Prioritize more specific subclasses (e.g., Superviseur_Regional over Superviseur)
    subject_classes = [cls for cls in classes if "Producteur" in cls or "Superviseur" in cls or "Transporteur" in cls or "Collecteur" in cls]
    object_classes = [cls for cls in classes if ("Dechet" in cls or "Dechets" in cls) or ("Centre" in cls or "Usine" in cls)]
    
    # Choose the most specific subject class (longer name = more specific)
    if subject_classes:
        subject_class = max(subject_classes, key=len)
    
    # Choose the most specific object class
    if object_classes:
        object_class = max(object_classes, key=len)
    
    # If we have object_class but no subject_class and no relation, make object_class the subject
    # This handles queries like "Quel centre a pour nom..."
    if not subject_class and object_class and not relations:
        subject_class = object_class
        object_class = None
    
    if not subject_class and classes:
        subject_class = classes[0]
    
    # Handle inverse relations
    inverse_relations = ["régulé_par"]
    relation = relations[0] if relations else None
    
    if subject_class and object_class and relation:
        if relation in ["trie", "traite_par_compostage", "accepte_pour_tri"]:
            # Relations entre Centre_tri/Centre_compostage et Dechets
            query_lines.append(f"?sujet a ?sujetType .")
            query_lines.append(f"?sujetType rdfs:subClassOf* ex:{subject_class} .")
            query_lines.append(f"?sujet ex:{relation} ?objet .")
            query_lines.append(f"?objet a ?objetType .")
            query_lines.append(f"?objetType rdfs:subClassOf* ex:{object_class} .")
            select_vars.append("?objet")
        
        elif relation == "envoie_vers_compostage":
            # Relation entre Centre_tri et Centre_compostage
            query_lines.append(f"?sujet a ?sujetType .")
            query_lines.append(f"?sujetType rdfs:subClassOf* ex:{subject_class} .")
            query_lines.append(f"?sujet ex:{relation} ?objet .")
            query_lines.append(f"?objet a ?objetType .")
            query_lines.append(f"?objetType rdfs:subClassOf* ex:{object_class} .")
            select_vars.append("?objet")
        # Check if relation is inverse
        if relation in inverse_relations:
            # For régulé_par: Dechet régulé_par Superviseur
            if "Dechet" in object_class or "Dechets" in object_class:
                query_lines.append(f"?objet a ?objetType .")
                query_lines.append(f"?objetType rdfs:subClassOf* ex:{object_class} .")
                query_lines.append(f"?objet ex:{relation} ?sujet .")
                query_lines.append(f"?sujet a ?sujetType .")
                query_lines.append(f"?sujetType rdfs:subClassOf* ex:{subject_class} .")
                select_vars.append("?objet")
            else:
                query_lines.append(f"?sujet a ?sujetType .")
                query_lines.append(f"?sujetType rdfs:subClassOf* ex:{subject_class} .")
                query_lines.append(f"?sujet ex:{relation} ?objet .")
                query_lines.append(f"?objet a ?objetType .")
                query_lines.append(f"?objetType rdfs:subClassOf* ex:{object_class} .")
                select_vars.append("?objet")
        else:
            # Include subclasses for both subject and object
            query_lines.append(f"?sujet a ?sujetType .")
            query_lines.append(f"?sujetType rdfs:subClassOf* ex:{subject_class} .")
            query_lines.append(f"?sujet ex:{relation} ?objet .")
            query_lines.append(f"?objet a ?objetType .")
            query_lines.append(f"?objetType rdfs:subClassOf* ex:{object_class} .")
            select_vars.append("?objet")

        for attr in attrs:
            # Handle boolean attributes - use FILTER for boolean comparison
            if attr['name'] in ["actif", "estCertifie", "estAgree"]:
                bool_value = "true" if attr['value'].lower() in ['true', 'vrai', 'oui', '1'] else "false"
                query_lines.append(f"?sujet ex:{attr['name']} ?{attr['name']} .")
                query_lines.append(f"FILTER(?{attr['name']} = \"{bool_value}\"^^xsd:boolean)")
            else:
                query_lines.append(f"?sujet ex:{attr['name']} \"{attr['value']}\" .")

    elif subject_class and relation:
        # Include subclasses for subject
        query_lines.append(f"?sujet a ?sujetType .")
        query_lines.append(f"?sujetType rdfs:subClassOf* ex:{subject_class} .")
        query_lines.append(f"?sujet ex:{relation} ?objet .")
        select_vars.append("?objet")

        for attr in attrs:
            # Handle boolean attributes - use FILTER for boolean comparison
            if attr['name'] in ["actif", "estCertifie", "estAgree"]:
                bool_value = "true" if attr['value'].lower() in ['true', 'vrai', 'oui', '1'] else "false"
                query_lines.append(f"?sujet ex:{attr['name']} ?{attr['name']} .")
                query_lines.append(f"FILTER(?{attr['name']} = \"{bool_value}\"^^xsd:boolean)")
            else:
                query_lines.append(f"?sujet ex:{attr['name']} \"{attr['value']}\" .")

    elif subject_class:
        # Simple approach - check if subject is of type subject_class or any subclass
        query_lines.append(f"?sujet a ?type .")
        query_lines.append(f"?type rdfs:subClassOf* ex:{subject_class} .")
        
        for attr in attrs:
            # Handle boolean attributes - use FILTER for boolean comparison
            if attr['name'] in ["actif", "estCertifie", "estAgree"]:
                bool_value = "true" if attr['value'].lower() in ['true', 'vrai', 'oui', '1'] else "false"
                # Use FILTER with xsd:boolean type for proper comparison
                query_lines.append(f"?sujet ex:{attr['name']} ?{attr['name']} .")
                query_lines.append(f"FILTER(?{attr['name']} = \"{bool_value}\"^^xsd:boolean)")
            else:
                query_lines.append(f"?sujet ex:{attr['name']} \"{attr['value']}\" .")

    elif object_class and relation:
        # Check if relation is inverse
        if relation in inverse_relations:
            query_lines.append(f"?objet a ex:{object_class} .")
            query_lines.append(f"?objet ex:{relation} ?sujet .")
            select_vars.append("?objet")
        else:
            query_lines.append(f"?objet a ex:{object_class} .")
            query_lines.append(f"?sujet ex:{relation} ?objet .")
            select_vars.append("?objet")
        
        for attr in attrs:
            # Handle boolean attributes - use FILTER for boolean comparison
            if attr['name'] in ["actif", "estCertifie", "estAgree"]:
                bool_value = "true" if attr['value'].lower() in ['true', 'vrai', 'oui', '1'] else "false"
                query_lines.append(f"?sujet ex:{attr['name']} ?{attr['name']} .")
                query_lines.append(f"FILTER(?{attr['name']} = \"{bool_value}\"^^xsd:boolean)")
            else:
                query_lines.append(f"?sujet ex:{attr['name']} \"{attr['value']}\" .")

    elif object_class and attrs and not relation:
        # Handle case where we have object_class (like Centre) with attributes but no relation
        query_lines.append(f"?sujet a ?type .")
        query_lines.append(f"?type rdfs:subClassOf* ex:{object_class} .")
        
        for attr in attrs:
            # Handle boolean attributes - use FILTER for boolean comparison
            if attr['name'] in ["actif", "estCertifie", "estAgree"]:
                bool_value = "true" if attr['value'].lower() in ['true', 'vrai', 'oui', '1'] else "false"
                query_lines.append(f"?sujet ex:{attr['name']} ?{attr['name']} .")
                query_lines.append(f"FILTER(?{attr['name']} = \"{bool_value}\"^^xsd:boolean)")
            else:
                query_lines.append(f"?sujet ex:{attr['name']} \"{attr['value']}\" .")
    
    elif attrs:
        for attr in attrs:
            # Handle boolean attributes - use FILTER for boolean comparison
            if attr['name'] in ["actif", "estCertifie", "estAgree"]:
                bool_value = "true" if attr['value'].lower() in ['true', 'vrai', 'oui', '1'] else "false"
                query_lines.append(f"?sujet ex:{attr['name']} ?{attr['name']} .")
                query_lines.append(f"FILTER(?{attr['name']} = \"{bool_value}\"^^xsd:boolean)")
            else:
                query_lines.append(f"?sujet ex:{attr['name']} \"{attr['value']}\" .")

    
    else:
        query_lines.append("?sujet ?p ?o .")
        select_vars.append("?o")

    # Project all bound variables so the frontend can optionally show a full table
    select_clause = "SELECT *"
    where_clause = "\n".join(query_lines)
    
    return f"{PREFIX}{select_clause} WHERE {{\n{where_clause}\n}}"


if __name__ == "__main__":
    tests = [
        "Quel producteur a pour nom Usine Peugeot Sochaux",
        "Quel producteur a nom Usine Peugeot Sochaux", 
        "Quels producteurs industriels produisent des déchets plastiques à Sochaux",
        "Quels agriculteurs produisent des déchets organiques",
        "Quels déchets plastiques sont produits",
        "Liste des producteurs à Tunis",
        "Usines qui produisent des déchets chimiques",
        
        "Quel superviseur audite le centre de tri Ariana Nord",
        "Quel superviseur national supervise le centre compostage Manouba",

        "Quels centres de recyclage sont suspendus",
        "Quel centre a pour nom Centre Compostage Manouba",
        "Quels superviseurs sont affectés à un centre de compostage",
        "Quels superviseurs sont affectés à un centre de tri Ariana Nord",
        "Quels centres de compostage sont en service",
        "Quel centre a pour nom Centre Tri Ariana Nord",
        "Liste des centres de traitement",
        "Liste des superviseurs",
        "Quels superviseurs sont actifs",
        
        "Liste des transporteurs",
        "Quels transporteurs sont certifiés",
        "Quel transporteur transporte des déchets plastiques",
        "Quels déchets sont transportés par un transporteur spécialisé",
        
        "Liste des collecteurs",
        "Quels collecteurs sont agréés",
        "Quel collecteur collecte des déchets organiques",
        "Quels déchets sont collectés par un collecteur municipal"


                "Quels centres de tri traitent les déchets plastiques",
        "Quel centre de compostage accepte les déchets organiques",
        "Liste des centres de tri automatique",
        "Quel centre trie les déchets métalliques",
        "Centres de compostage industriel à Paris",
        "Quel centre envoie vers le compostage",
        "Centres de tri avec capacité > 50 tonnes",
        "Quels déchets sont triés par le centre TriAuto Paris",
        "Centres de compostage avec température > 60°C",
        "Quel centre a pour nom Compost Industriel Lille"
    ]

    for q in tests:
        print("\nQuestion:", q)
        entities = extract_entities(q)
        print("Entities:", entities)
        sparql = generate_sparql_from_entities(entities)
        print("SPARQL:\n", sparql)
        print("---")