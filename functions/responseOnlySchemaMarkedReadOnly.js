let requestSchemas;

function getRequestSchemas(oasDoc) {
  const topLevelRequestSchemas = Object.values(oasDoc.paths || {})
    .flatMap(({ put, post, patch }) => [put, post, patch])
    .filter(Boolean)
    .flatMap(({ parameters }) => parameters?.filter(({ in: location }) => location === 'body') || [])
    .flatMap(({ schema }) => (schema ? [schema] : []))
    .filter(({ $ref }) => $ref && $ref.match(/^#\/definitions\//))
    .map(({ $ref }) => $ref.replace(/^#\/definitions\//, ''));

  requestSchemas = new Set();
  const schemasToProcess = [...topLevelRequestSchemas];

  while (schemasToProcess.length > 0) {
    const schemaName = schemasToProcess.pop();
    requestSchemas.add(schemaName);
    const schema = oasDoc.definitions[schemaName];
    if (schema) {
      if (schema.properties) {
        for (const property of Object.values(schema.properties)) {
          const refs = [property.$ref, property.items?.$ref, property.additionalProperties?.$ref].filter(Boolean).map((ref) => ref.replace(/^#\/definitions\//, ''));

          for (const ref of refs) {
            if (!requestSchemas.has(ref) && !schemasToProcess.includes(ref)) {
              schemasToProcess.push(ref);
            }
          }
        }
      }

      if (schema.allOf) {
        for (const element of schema.allOf) {
          const ref = element.$ref?.replace(/^#\/definitions\//, '');
          if (ref && !requestSchemas.has(ref) && !schemasToProcess.includes(ref)) {
            schemasToProcess.push(ref);
          }
        }
      }

      if (schema.discriminator) {
        const schemaRef = `#/definitions/${schemaName}`;
        for (const [key, value] of Object.entries(oasDoc.definitions)) {
          if (value.allOf?.some((elem) => elem.$ref === schemaRef)) {
            schemasToProcess.push(key);
          }
        }
      }
    }
  }
}

function hashCode(str) {
  let hash = 0;
  for (const char of str) {
    const charCode = char.charCodeAt(0);
    hash = (hash * 31 + charCode) % Number.MAX_SAFE_INTEGER;
  }

  return hash;
}

let docHash;

function responseOnlySchema(schemaName, oasDoc) {
  const thisDocHash = hashCode(JSON.stringify(oasDoc));
  if (!requestSchemas || docHash !== thisDocHash) {
    getRequestSchemas(oasDoc);
    docHash = thisDocHash;
  }

  return !requestSchemas.has(schemaName);
}

/**
 * Validate that properties of response-only schemas are not marked as readOnly.
 *
 * @param {object} schema - The schema of a request or response body.
 * @param {object} _options
 * @param {object} context - The context object containing path and other validation details.
 * @returns {Array} List of errors if properties of a response-only schema are marked readOnly.
 */
export default function responseOnlySchemaMarkedReadOnly(schema, _options, context) {
  const schemaName = context.path[context.path.length - 1];
  const oasDoc = context.document.data;

  if (!responseOnlySchema(schemaName, oasDoc)) {
    return [];
  }

  const errors = [];

  for (const [propertyName, property] of Object.entries(schema.properties || {})) {
    if (property.readOnly) {
      errors.push({
        message: 'Property of response-only schema should not be marked readOnly',
        path: [...context.path, 'properties', propertyName, 'readOnly'],
      });
    }
  }

  return errors;
}
