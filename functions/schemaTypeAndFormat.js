/**
 * Validate that the format is valid for a schema type.
 * Valid formats are those defined in the OpenAPI spec.
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

  const validTypes = ['string', 'number', 'integer', 'boolean', 'array', 'object'];

  if (schema.type && !validTypes.includes(schema.type)) {
    errors.push({
      message: `Schema should use well-defined type and format.`,
      path: [...path, 'type'],
    });
  }

  // // Validate format for "string" type
  // if (schema.type === 'string') {
  //   const stringFormats = [
  //     'byte', //
  //     'binary',
  //     'date',
  //     'date-time',
  //     'password',
  //     'email',
  //     'hostname',
  //     'char',
  //     'time',
  //     'duration',
  //     'uuid',
  //     'url',
  //     'uri',
  //   ];

  //   if (schema.format && !stringFormats.includes(schema.format)) {
  //     errors.push({
  //       message: `Schema with type: string has unrecognized format: ${schema.format}`,
  //       path: [...path, 'format'],
  //     });
  //   }
  // }
  if (schema.type === 'integer') {
    if (schema.format) {
      if (!['int32', 'int64'].includes(schema.format)) {
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
  } else if (schema.type === 'number') {
    if (schema.format) {
      if (!['float', 'double'].includes(schema.format)) {
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
  } else if (schema.type === 'boolean') {
    if (schema.format) {
      errors.push({
        message: 'Schema with type: boolean should not specify format',
        path: [...path, 'format'],
      });
    }
  } else if (schema.type === 'array') {
    if (!schema.items) {
      errors.push({
        message: 'Schema with type: array should specify items',
        path: [...path],
      });
    }
  }

  if (schema.properties && typeof schema.properties === 'object') {
    for (const [key, value] of Object.entries(schema.properties)) {
      errors.push(...schemaTypeAndFormat(value, options, { path: [...path, 'properties', key] }));
    }
  }

  if (schema.items) {
    errors.push(...schemaTypeAndFormat(schema.items, options, { path: [...path, 'items'] }));
  }

  if (schema.allOf && Array.isArray(schema.allOf)) {
    for (const [index, value] of schema.allOf.entries()) {
      errors.push(...schemaTypeAndFormat(value, options, { path: [...path, 'allOf', index] }));
    }
  }

  return errors;
}
