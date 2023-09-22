let express = require('express');
let fs = require('fs');
let logger = require("../modules/logger");
let d3 = require('d3-sparql');
require('dotenv').config();

let log = logger.application;
let router = express.Router();
let agrovoc = require('../data/dumpAgrovocEntities.json')

log.info('Starting up backend services');


/**
 * Read a SPARQL query template and replace the {id} placeholder
 * @param {string} template file name
 * @param {number} id value to replace "{id}" with
 * @returns {string} SPARQL query string
 */
function readTemplate(template, id) {
    let queryTpl = fs.readFileSync('queries/' + template, 'utf8');
    return queryTpl.replaceAll("{id}", id);
}


/**
 * Sort 2 strings in case-insensitive alphabetic order
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
function sortStrings(a, b) {
    let aa = a.entityLabel.toLowerCase();
    let bb = b.entityLabel.toLowerCase();
    if (aa < bb)
        return -1;
    if (aa > bb)
        return 1;
    return 0;
}


/**
 * Get article metaData (title , date , articleType ... )  without the authors
 * @param uri: URI of the document
 */
router.get('/getArticleMetadata/', (req, res) => {
    let articleUri = req.query.uri;
    log.info('getArticleMetadata - uri: ' + articleUri);
    let query = readTemplate("getArticleMetadata.sparql", articleUri);
    if (log.isDebugEnabled()) {
        log.debug('getArticleMetadata - Will submit SPARQL query: \n' + query);
    }

    (async () => {
        let result;
        try {
            result = await d3.sparql(process.env.SEMANTIC_INDEX_SPARQL_ENDPOINT, query).then((data) => {
                if (log.isTraceEnabled()) {
                    log.trace('getArticleMetadata - SPARQL response: ');
                    data.forEach(res => log.trace(res));
                }
                return data;
            }).then(res => res);

        } catch (err) {
            log.error('getArticleMetadata error: ' + err);
            result = err;
        }
        res.status(200).json({result});
    })()
});


/**
 * GET article authors
 * @param uri: URI of the document
 */
router.get('/getArticleAuthors/', (req, res) => {
    let articleUri = req.query.uri;
    log.info('getArticleAuthors - uri: ' + articleUri);
    let query = readTemplate("getArticleAuthors.sparql", articleUri);
    if (log.isDebugEnabled()) {
        log.debug('getArticleAuthors - Will submit SPARQL query: \n' + query);
    }

    (async () => {
        let result;
        try {
            result = await d3.sparql(process.env.SEMANTIC_INDEX_SPARQL_ENDPOINT, query).then((data) => {
                if (log.isTraceEnabled()) {
                    log.trace('getArticleAuthors - SPARQL response: ');
                    data.forEach(res => log.trace(res));
                }
                return data;
            }).then(res => res);

        } catch (err) {
            log.error('getArticleAuthors error: ' + err);
            result = err;
        }
        res.status(200).json({result});
    })()
});


/**
 * Get named entities
 * @param uri: URI of the document
 */
router.get('/getAbstractNamedEntities/', (req, res) => {
    let articleUri = req.query.uri;
    log.info('getAbstractNamedEntities - uri: ' + articleUri);
    articleUri = articleUri + "#abstract";
    let query = readTemplate("getNamedEntities.sparql", articleUri);
    if (log.isDebugEnabled()) {
        log.debug('getNamedEntities - Will submit SPARQL query: \n' + query);
    }

    (async () => {
        let result;

        try {
            result = await d3.sparql(process.env.SEMANTIC_INDEX_SPARQL_ENDPOINT, query).then((data) => {
                if (log.isTraceEnabled()) {
                    log.trace('getNamedEntities - SPARQL response: ');
                    data.forEach(res => log.trace(res));
                }
                return data;
            }).then(res => res);

        } catch (err) {
            log.error('getAbstractNamedEntities error: ' + err);
            result = err;
        }
        res.status(200).json({result});
    })()
});


/**
 * Get the geographical named entities whatever the article part
 * @param uri: URI of the document
 */
router.get('/getGeographicNamedEntities/', (req, res) => {
    let articleUri = req.query.uri;
    log.info('getGeographicNamedEntities - uri: ' + articleUri);
    let query = readTemplate("getGeographicNamedEntities.sparql", articleUri);
    if (log.isDebugEnabled()) {
        log.debug('getGeographicNamedEntities - Will submit SPARQL query: \n' + query);
    }

    (async () => {
        let result;

        let opts = {method: 'POST'};
        try {
            result = await d3.sparql(process.env.SEMANTIC_INDEX_SPARQL_ENDPOINT, query, opts).then((data) => {
                if (log.isTraceEnabled()) {
                    log.trace('getGeographicalNamedEntities - SPARQL response: ');
                    data.forEach(res => log.trace(res));
                }
                return data;
            }).then(res => res);

        } catch (err) {
            log.error('getGeographicalNamedEntities error: ' + err);
            result = err;
        }
        res.status(200).json({result});
    })()
});


/**
 * Get global descriptors : The global descriptors are concepts characterizing the article as a whole
 * @param uri: URI of the document
 */
router.get('/getArticleDescriptors/', (req, res) => {
    let articleUri = req.query.uri;
    log.info('getArticleDescriptors - uri: ' + articleUri);
    let query = readTemplate("getArticleDescriptors.sparql", articleUri);
    if (log.isDebugEnabled()) {
        log.debug('getArticleDescriptors - Will submit SPARQL query: \n' + query);
    }

    (async () => {
        let result;
        try {
            result = await d3.sparql(process.env.SEMANTIC_INDEX_SPARQL_ENDPOINT, query).then((data) => {
                if (log.isTraceEnabled()) {
                    log.trace('getArticleDescriptors - SPARQL response: ');
                    data.forEach(res => log.trace(res));
                }
                return data;
            }).then(res => res);

        } catch (err) {
            log.error('getArticleDescriptors error: ' + err);
            result = err;
        }
        res.status(200).json({result});
    })()
});


/**
 * Complete the user's input using the Agrovoc labels.
 * The output is a JSON array whose documents are shaped as in the example below:
 *     {
 *         "entityUri": "http://aims.fao.org/aos/agrovoc/c_4459",
 *         "entityLabel": "Luffa cylindrica",
 *         "entityPrefLabel": "Luffa aegyptica",
 *         "count": "1"
 *     }
 *  Count is the number of documents in the knowledge base that are assigned the descriptor with this URI/label.
 * @param input: first characters entered by the use
 */
router.get('/autoCompleteAgrovoc/', (req, res) => {
    let input = req.query.input.toLowerCase();
    if (log.isTraceEnabled()) {
        log.trace('autoCompleteAgrovoc - input: ' + input);
    }

    // Count the number of entities selected (to return ony a maximum number)
    let _count = 0;

    // Search for entities whose label starts like the input
    let _startsWith = agrovoc.filter(_entity => {
        if (_count < process.env.SEARCH_MAX_AUTOCOMPLETE) {
            if (_entity.entityLabel.toLowerCase().startsWith(input)) {
                _count++;
                return true;
            }
        } else return false;
    }).sort(sortStrings);

    if (log.isTraceEnabled()) {
        log.trace('autoCompleteAgrovoc - Result _startsWith: ');
        _startsWith.forEach(res => log.trace(res));
    }

    let _includes = agrovoc.filter(_entity => {
        if (_count < process.env.SEARCH_MAX_AUTOCOMPLETE) {
            let _entityLabLow = _entity.entityLabel.toLowerCase()

            // Find entities whose label includes the input but that was not already selected above
            if (_entityLabLow.includes(input) &&
                !_startsWith.some(_s => _s.entityLabel.toLowerCase() === _entityLabLow && _s.entityUri === _entity.entityUri)) {
                _count++;
                return true;
            }
        } else return false;
    }).sort(sortStrings);

    if (log.isTraceEnabled()) {
        log.trace('autoCompleteAgrovoc - Result includes: ');
        _includes.forEach(res => log.trace(res));
    }

    res.status(200).json(_startsWith.concat(_includes));
});


/**
 * Search for documents annotated with a set of descriptors given by their URIs
 * @param uri: URIs of the descriptor to search, passed on the query string either as "uri=a,b,..." or "uri=a&uri=b&..."
 */
router.get('/searchDocumentsByDescriptor/', (req, res) => {
    let uri = req.query.uri;
    log.info('searchDocumentsByDescriptor - uri: [' + uri + ']');

    if (uri.length === 0) {
        log.info('searchDocumentsByDescriptor - no parameter, returning empty response');
        res.status(200).json({result: []});

    } else {
        // Create the SPARQL triple patterns to match each one of the URIs
        let lineTpl = '    ?document ^oa:hasTarget [ oa:hasBody <{uri}> ].';
        let lines = '';
        let uris = uri.split(',');
        uris.forEach(_uri => {
            lines += lineTpl.replaceAll("{uri}", _uri) + '\n';
        })

        // Insert the triple patterns into the SPARQL query
        let queryTpl = fs.readFileSync('queries/searchArticleByDescriptor.sparql', 'utf8');
        let query = queryTpl.replace("{triples}", lines);

        if (log.isDebugEnabled()) {
            log.debug('searchDocumentsByDescriptor - Will submit SPARQL query: \n' + query);
        }

        (async () => {
            let result = [];
            try {
                result = await d3.sparql(process.env.SEMANTIC_INDEX_SPARQL_ENDPOINT, query).then((data) => {
                    log.info('searchDocumentsByDescriptor returned ' + data.length + ' results');
                    if (log.isTraceEnabled()) {
                        log.trace('searchDocumentsByDescriptor - SPARQL response: ');
                        data.forEach(res => log.trace(res));
                    }
                    return data;
                }).then(res => res);

            } catch (err) {
                log.error('searchDocumentsByDescriptor error: ' + err);
                result = err;
            }
            res.status(200).json({result});
        })()
    }
});


/**
 * Search for documents annotated with a set of descriptors given by their URIs
 * @param uri: URIs of the descriptor to search, passed on the query string either as "uri=a,b,..." or "uri=a&uri=b&..."
 */
router.get('/searchDocumentsByDescriptorSubConcept/', (req, res) => {
    let uri = req.query.uri;
    log.info('searchDocumentsByDescriptorSubConcept - uri: [' + uri + ']');

    if (uri.length === 0) {
        log.info('searchDocumentsByDescriptorSubConcept - no parameter, returning empty response');
        res.status(200).json({result: []});

    } else {
        // Submit one SPARQL query for each URI
        let uris = uri.split(',');
        let promises = [];
        uris.forEach(_uri => {
            // Insert the triple patterns into the SPARQL query
            let query = readTemplate("searchArticleByDescriptorSubConcept.sparql", _uri);
            if (log.isDebugEnabled()) {
                log.debug('searchDocumentsByDescriptorSubConcept - Will submit SPARQL query: \n' + query);
            }

            // Submit the SPARQL query and save the promise
            let _promise = (async () => {
                let _result = [];
                try {
                    _result = await d3.sparql(process.env.SEMANTIC_INDEX_SPARQL_ENDPOINT, query).then((data) => {
                        log.info('searchDocumentsByDescriptorSubConcept: query for uri ' + _uri + ' returned ' + data.length + ' results');
                        return data;
                    }).then(res => res);
                } catch (err) {
                    log.error('searchDocumentsByDescriptorSubConcept error: ' + err);
                    _result = err;
                }
                return _result;
            })();
            promises.push(_promise);
        })

        // Wait for all the responses and do the intersection of all of them
        let joinedResults = [];
        Promise.allSettled(promises).then((_promises) => {
            _promises.forEach((_promise, index) => {
                if (index === 0) {
                    joinedResults = _promise.value;
                } else {
                    joinedResults = joinedResults.filter(_r => _promise.value.some(_n => _n.document === _r.document));
                }
                log.info("searchDocumentsByDescriptorSubConcept: current number of results : " + joinedResults.length);
            });
            log.info("searchDocumentsByDescriptorSubConcept: returning : " + joinedResults.length + " results");
            res.status(200).json({"result": joinedResults});
        });
    }
});

/**
 * Search for documents annotated with a set of descriptors given by their URIs
 * @param uri: URIs of the descriptor to search, passed on the query string either as "uri=a,b,..." or "uri=a&uri=b&..."
 */
router.get('/searchDocumentsByDescriptorRelated/', (req, res) => {
    let uri = req.query.uri;
    if (log.isInfoEnabled()) {
        log.info('searchDocumentsByDescriptorRelated - uri: [' + uri + ']');
    }

    if (uri.length === 0) {
        if (log.isInfoEnabled()) {
            log.info('searchDocumentsByDescriptorRelated - no parameter, returning empty response');
        }
        res.status(200).json({result: []});

    } else {
        // Submit one SPARQL query for each URI
        let uris = uri.split(',');
        let promises = [];
        uris.forEach(_uri => {
            // Insert the triple patterns into the SPARQL query
            let query = readTemplate("searchArticleByDescriptorRelated.sparql", _uri);
            if (log.isDebugEnabled()) {
                log.debug('searchDocumentsByDescriptorRelated - Will submit SPARQL query: \n' + query);
            }

            // Submit the SPARQL query and save the promise
            let _promise = (async () => {
                let _result = [];
                try {
                    _result = await d3.sparql(process.env.SEMANTIC_INDEX_SPARQL_ENDPOINT, query).then((data) => {
                        log.info('searchDocumentsByDescriptorRelated: query for uri ' + _uri + ' returned ' + data.length + ' results');
                        return data;
                    }).then(res => res);
                } catch (err) {
                    log.error('searchDocumentsByDescriptorRelated error: ' + err);
                    _result = err;
                }
                return _result;
            })();
            promises.push(_promise);
        })

        // Wait for all the responses and do the intersection of all of them
        let joinedResults = [];
        Promise.allSettled(promises).then((_promises) => {
            _promises.forEach((_promise, index) => {
                if (index === 0) {
                    joinedResults = _promise.value;
                } else {
                    joinedResults = joinedResults.filter(_r => _promise.value.some(_n => _n.document === _r.document));
                }
                log.info("searchDocumentsByDescriptorRelated: current number of results : " + joinedResults.length);
            });
            log.info("searchDocumentsByDescriptorRelated: returning : " + joinedResults.length + " results");
            res.status(200).json({"result": joinedResults});
        });
    }
});


module.exports = router;
