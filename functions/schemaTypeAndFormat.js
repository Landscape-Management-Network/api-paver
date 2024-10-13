/**
 * Validate that the format is valid for a schema type.
 * Valid formats are those defined in the OpenAPI spec and extensions in AutoRest.
 *
 * @param {object} schema - The schema of a request or response body.
 * @param {object} options
 * @param {object} context - The context object containing path and other validation details.
 * @returns {Array} List of errors if schema types have invalid or missing formats.
 */
export default function schemaTypeAndFormat(schema, options, { path }) {
  if (schema === null || typeof schema !== 'object') {
    return [];
  }

  const errors = [];

  // Valid string formats for OAS and AutoRest
  const stringFormats = [
    'byte', //
    'binary',
    'date',
    'date-time',
    'password',
    'char',
    'time',
    'date-time-rfc1123',
    'duration',
    'uuid',
    'base64url',
    'url',
    'uri',
    'odata-query',
    'certificate',
  ];

  // Validate format for "string" type
  if (schema.type === 'string') {
    if (schema.format && !stringFormats.includes(schema.format)) {
      errors.push({
        message: `Schema with type: string has unrecognized format: ${schema.format}`,
        path: [...path, 'format'],
      });
    }
  }

  // Validate format for "integer" type
  else if (schema.type === 'integer') {
    if (schema.format) {
      if (!['int32', 'int64', 'unixtime'].includes(schema.format)) {
        errors.push({
          message: `Schema with type: integer has unrecognized format: ${schema.format}`,
          path: [...path, 'format'],
        });
      }
    } else {
      errors.push({
        message: 'Schema with type: integer should specify format',
        path,
      });
    }
  }

  // Validate format for "number" type
  else if (schema.type === 'number') {
    if (schema.format) {
      if (!['float', 'double', 'decimal'].includes(schema.format)) {
        errors.push({
          message: `Schema with type: number has unrecognized format: ${schema.format}`,
          path: [...path, 'format'],
        });
      }
    } else {
      errors.push({
        message: 'Schema with type: number should specify format',
        path,
      });
    }
  }

  // Boolean should not specify a format
  else if (schema.type === 'boolean') {
    if (schema.format) {
      errors.push({
        message: 'Schema with type: boolean should not specify format',
        path: [...path, 'format'],
      });
    }
  }

  // Recursively check nested properties
  else if (schema.properties && typeof schema.properties === 'object') {
    for (const [key, value] of Object.entries(schema.properties)) {
      errors.push(...schemaTypeAndFormat(value, options, { path: [...path, 'properties', key] }));
    }
  }

  // Validate "array" types recursively
  if (schema.type === 'array') {
    errors.push(...schemaTypeAndFormat(schema.items, options, { path: [...path, 'items'] }));
  }

  // Validate "allOf" schemas recursively
  if (schema.allOf && Array.isArray(schema.allOf)) {
    for (const [index, value] of schema.allOf.entries()) {
      errors.push(...schemaTypeAndFormat(value, options, { path: [...path, 'allOf', index] }));
    }
  }

  return errors;
}
