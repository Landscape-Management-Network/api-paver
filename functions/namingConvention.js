import { pattern } from '@stoplight/spectral-functions';

/**
 * Check if the schema is a boolean type.
 * @param {object} schema - The schema object.
 * @returns {boolean} - True if the schema is boolean.
 */
function isBooleanSchema(schema) {
  return schema.type === 'boolean';
}

/**
 * Check if the schema is a date-time type.
 * @param {object} schema - The schema object.
 * @returns {boolean} - True if the schema is a date-time string.
 */
function isDateTimeSchema(schema) {
  return schema.type === 'string' && schema.format === 'date-time';
}

/**
 * Determine the function to validate schema types based on the specified type.
 * @param {string} type - The type to check (e.g., 'boolean', 'date-time').
 * @returns {function} - A function that checks if a schema matches the type.
 */
function isSchemaType(type) {
  switch (type) {
    case 'boolean':
      return isBooleanSchema;
    case 'date-time':
      return isDateTimeSchema;
    default:
      return () => false;
  }
}

/**
 * Recursively check all property names in the schema for naming convention compliance.
 * @param {object} schema - The schema object.
 * @param {object} options - The options (e.g., type, match pattern).
 * @param {array} path - The JSONPath of the schema.
 * @returns {array} - A list of error messages for invalid property names.
 */
function propertyNamingConvention(schema, options, path) {
  const errors = [];
  const { type, ...patternOpts } = options;
  const isType = isSchemaType(type);

  // Iterate over properties in the schema
  for (const name of schema.properties ? Object.keys(schema.properties) : []) {
    if (isType(schema.properties[name]) && pattern(name, patternOpts)) {
      errors.push({
        message: `Property "${name}" does not follow ${options.type} naming convention`,
        path: [...path, 'properties', name],
      });
    }

    // Recursively check nested properties
    if (schema.properties[name]?.properties) {
      errors.push(...propertyNamingConvention(schema.properties[name], options, [...path, 'properties', name]));
    }
  }

  // Handle items in arrays
  if (schema.items) {
    errors.push(...propertyNamingConvention(schema.items, options, [...path, 'items']));
  }

  // Handle `allOf`, `anyOf`, and `oneOf`
  for (const applicator of ['allOf', 'anyOf', 'oneOf']) {
    if (schema[applicator] && Array.isArray(schema[applicator])) {
      for (const [index, value] of schema[applicator].entries()) {
        errors.push(...propertyNamingConvention(value, options, [...path, applicator, index]));
      }
    }
  }

  return errors;
}

/**
 * Main function to check the naming convention in the OpenAPI document.
 * @param {object} oasDoc - The OpenAPI document (resolved).
 * @param {object} options - The options for the rule (e.g., type, match pattern).
 * @returns {array} - A list of errors if naming conventions are not followed.
 */
export default function namingConvention(oasDoc, options) {
  const oas2 = oasDoc.swagger === '2.0';
  const oas3 = oasDoc.openapi?.startsWith('3.') || false;

  const errors = [];

  for (const pathKey of Object.keys(oasDoc.paths)) {
    const pathItem = oasDoc.paths[pathKey];
    for (const opMethod of ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace']) {
      if (pathItem[opMethod]) {
        const op = pathItem[opMethod];

        // For OAS2 documents
        if (oas2) {
          for (let i = 0; i < op.parameters?.length || 0; i += 1) {
            const param = op.parameters[i];
            if (param.in !== 'body' && isSchemaType(options.type)(param) && pattern(param.name, options)) {
              errors.push({
                message: `Parameter "${param.name}" does not follow ${options.type} naming convention`,
                path: ['paths', pathKey, opMethod, 'parameters', i, 'name'],
              });
            }
          }

          const bodyParam = op.parameters?.find((param) => param.in === 'body');
          if (bodyParam) {
            const bodyIndex = op.parameters.indexOf(bodyParam);
            errors.push(...propertyNamingConvention(bodyParam.schema, options, ['paths', pathKey, opMethod, 'parameters', bodyIndex, 'schema']));
          }

          for (const [responseKey, response] of Object.entries(op.responses)) {
            if (response.schema) {
              errors.push(...propertyNamingConvention(response.schema, options, ['paths', pathKey, opMethod, 'responses', responseKey, 'schema']));
            }
          }
        }

        // For OAS3 documents
        if (oas3) {
          for (let i = 0; i < op.parameters?.length || 0; i += 1) {
            const param = op.parameters[i];
            if (param.schema && isSchemaType(options.type)(param.schema) && pattern(param.name, options)) {
              errors.push({
                message: `Parameter "${param.name}" does not follow ${options.type} naming convention`,
                path: ['paths', pathKey, opMethod, 'parameters', i, 'name'],
              });
            }
          }

          if (op.requestBody?.content) {
            for (const [contentTypeKey, contentType] of Object.entries(op.requestBody.content)) {
              if (contentType.schema) {
                errors.push(...propertyNamingConvention(contentType.schema, options, ['paths', pathKey, opMethod, 'requestBody', 'content', contentTypeKey, 'schema']));
              }
            }
          }

          if (op.responses) {
            for (const [responseKey, response] of Object.entries(op.responses)) {
              if (response.content) {
                for (const [contentTypeKey, contentType] of Object.entries(response.content)) {
                  if (contentType.schema) {
                    const propertyNamingErrors = propertyNamingConvention(contentType.schema, options, ['paths', pathKey, opMethod, 'responses', responseKey, 'content', contentTypeKey, 'schema']);
                    errors.push(...propertyNamingErrors);
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  return errors;
}
