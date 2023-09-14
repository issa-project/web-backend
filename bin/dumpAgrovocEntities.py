"""
This scipt retrives the labels and URIs of Agrovc concepts.
It is used for the auto-completion of user inputs on the search form.
"""

import json
from SPARQLWrapper import SPARQLWrapper, JSON, POST
import json
import math

endpoint = "https://data-issa.cirad.fr/sparql"
limit = 10000
totalResults = 53000

prefixes = '''
prefix skosxl:         <http://www.w3.org/2008/05/skos-xl#>
'''

query_tpl = prefixes + '''
SELECT distinct ?entityUri ?entityLabel ?entityPrefLabel
FROM <http://agrovoc.fao.org/graph>
WHERE {
    {
        ?entityUri skosxl:prefLabel/skosxl:literalForm ?entityLabel.
        FILTER (langMatches(lang(?entityLabel), "en"))
    } union {
        ?entityUri skosxl:altLabel/skosxl:literalForm ?entityLabel;
            skosxl:prefLabel/skosxl:literalForm ?entityPrefLabel
        FILTER (langMatches(lang(?entityLabel), "en"))
        FILTER (langMatches(lang(?entityPrefLabel), "en"))
    }
}
offset %(offset)s
limit %(limit)s
'''


def sparql_endpoint_call(query):
    """
    Simple execution of a SELECT SPARQL query with JSON response
    """
    sparql = SPARQLWrapper(endpoint)
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    results = sparql.query().convert()
    return results

if __name__ == '__main__':
    try:
        output = []
        for index in range(math.floor(totalResults/limit) + 1):
            offset = index * limit
            print(f"Querying SPARQL endpoint [limit: {limit}, offset: {offset}]...")
            results = sparql_endpoint_call(query_tpl % { "limit": limit, "offset": offset })

            # Simplify the SPARQL JSON format to keep only the values
            print("Reformatting output...")
            for row in results['results']['bindings']:
                item = {}
                item['entityUri'] = row['entityUri']['value']
                item['entityLabel'] = row['entityLabel']['value']
                if 'entityPrefLabel' in row:
                    item['entityPrefLabel'] = row['entityPrefLabel']['value']
                output.append(item)
            #print(results_json)

        print("Formatting the JSON output...")
        results_json = json.dumps(output, indent=4)
        print("Writing the output to JSON file...")
        with open(f"../data/dumpAgrovocEntities.json", 'w', encoding="utf-8") as f:
            f.write(results_json)

    except Exception as e:
        print('Error while processing SPARQL query: ' + str(e))
        exit