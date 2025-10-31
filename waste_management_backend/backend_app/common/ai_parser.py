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
    "Dechets_Textile", "Dechets_Volumineux", "Dechets_verre"
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
    "Dechets_Electronique": ["électronique", "electronique", "déchets électroniques", "appareils électroniques", "électroniques"]
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
            r'\bà\s+([A-ZÉÈÀ][a-zéèàêôûç\-]+)(?:\s|$|,)',
            r'\ba\s+([A-ZÉÈÀ][a-zéèàêôûç\-]+)(?:\s|$|,)',
            r'\bdans\s+la\s+ville\s+(?:de\s+)?([A-ZÉÈÀ][a-zéèàêôûç\-]+)',
            r'\bville\s+(?:de\s+)?([A-ZÉÈÀ][a-zéèàêôûç\-]+)',
            r'\bà\s+([A-ZÉÈÀ][a-zéèàêôûç\-]+)'
        ],
        "adresse": [
            r'\badresse\s+([\w\s\-\d,]+)'
        ],
        "codeMatiere": [
            r'\bcode\s+mati[èe]re\s+([\w\-]+)',
            r'\bmati[èe]re\s+([\w\-]+)'
        ]
    }

    for attr_name, pattern_list in patterns.items():
        for pattern in pattern_list:
            matches = re.finditer(pattern, question, re.IGNORECASE)
            for match in matches:
                value = match.group(1).strip()
                if value and value.lower() not in ['pour', 'nom', 'est', 'a', 'dans', 'la', 'de']:
                    attrs.append({"name": attr_name, "value": value})

    
    unique_attrs = []
    seen = set()
    for attr in attrs:
        key = (attr['name'], attr['value'])
        if key not in seen:
            seen.add(key)
            unique_attrs.append(attr)
    
    return unique_attrs


RELATIONS = {
    "produit": ["produit", "produisent", "fabriquent", "génèrent", "créent", "manufacturent"]
}

def detect_relation(question: str):
    q_lower = question.lower()
    for rel, keywords in RELATIONS.items():
        for kw in keywords:
            if kw in q_lower:
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

    

    classes_list = list(found_classes)
    subject_classes = [cls for cls in classes_list if "Producteur" in cls]
    object_classes = [cls for cls in classes_list if "Dechet" in cls or "Dechets" in cls]
    ordered_classes = subject_classes + object_classes
    entities["classes"] = ordered_classes

    rel = detect_relation(question)
    if rel:
        entities["relations"].append(rel)
    attrs = detect_attribute(question)
    if attrs:
        entities["attrs"] = attrs

    return entities



def generate_sparql_from_entities(entities: dict) -> str:
    PREFIX = """PREFIX ex: <http://www.semanticweb.org/wiemb/ontologies/2025/8/untitled-ontology-2#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
"""

    classes = entities.get("classes", [])
    relations = entities.get("relations", [])
    attrs = entities.get("attrs", [])

    query_lines = []
    select_vars = ["?sujet"]

    subject_class = None
    object_class = None
    
    for cls in classes:
        if "Producteur" in cls and not subject_class:
            subject_class = cls
        elif ("Dechet" in cls or "Dechets" in cls) and not object_class:
            object_class = cls
    
    if not subject_class and classes:
        subject_class = classes[0]
    
    if subject_class and object_class and relations:
        query_lines.append(f"?sujet a ex:{subject_class} .")
        query_lines.append(f"?sujet ex:{relations[0]} ?objet .")
        query_lines.append(f"?objet a ex:{object_class} .")
        select_vars.append("?objet")

        for attr in attrs:
            query_lines.append(f"?sujet ex:{attr['name']} \"{attr['value']}\" .")

    elif subject_class and relations:
        query_lines.append(f"?sujet a ex:{subject_class} .")
        query_lines.append(f"?sujet ex:{relations[0]} ?objet .")
        select_vars.append("?objet")

        for attr in attrs:
            query_lines.append(f"?sujet ex:{attr['name']} \"{attr['value']}\" .")

    elif subject_class:
        query_lines.append(f"?sujet a ex:{subject_class} .")
        
        for attr in attrs:
            query_lines.append(f"?sujet ex:{attr['name']} \"{attr['value']}\" .")

    
    elif object_class and relations:
        query_lines.append(f"?objet a ex:{object_class} .")
        query_lines.append(f"?sujet ex:{relations[0]} ?objet .")
        select_vars.append("?objet")
        
        for attr in attrs:
            query_lines.append(f"?sujet ex:{attr['name']} \"{attr['value']}\" .")

    elif attrs:
        for attr in attrs:
            query_lines.append(f"?sujet ex:{attr['name']} \"{attr['value']}\" .")

    
    else:
        query_lines.append("?sujet ?p ?o .")
        select_vars.append("?o")

    select_clause = "SELECT " + " ".join(select_vars)
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
        "Usines qui produisent des déchets chimiques"
    ]

    for q in tests:
        print("\nQuestion:", q)
        entities = extract_entities(q)
        print("Entities:", entities)
        sparql = generate_sparql_from_entities(entities)
        print("SPARQL:\n", sparql)
        print("---")