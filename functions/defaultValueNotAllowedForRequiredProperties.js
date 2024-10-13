/**
 * Validate that required schema properties do not have a default value.
 *
 * @param {object} schema - The schema of a request or response body.
 * @param {object} options - Options passed to the function (not used here).
 * @param {object} context - The context object containing path and other validation details.
 * @returns {Array} List of errors if required properties have a default value.
 */
export default function defaultValueNotAllowedForRequiredProperties(schema, options, { path }) {
  if (schema === null || typeof schema !== 'object') {
    return [];
  }

  const errors = [];

  // Check if required properties have a default value
  for (const requiredProp of schema.required || []) {
    if (schema.properties?.[requiredProp]?.default) {
      errors.push({
        message: `Schema property "${requiredProp}" is required and cannot have a default value.`,
        path: [...path, 'properties', requiredProp, 'default'],
      });
    }
  }

  // Recursively check nested properties
  if (schema.properties && typeof schema.properties === 'object') {
    for (const [key, value] of Object.entries(schema.properties)) {
      errors.push(...defaultValueNotAllowedForRequiredProperties(value, options, { path: [...path, 'properties', key] }));
    }
  }

  // Check schema items if they exist (for arrays)
  if (schema.items) {
    errors.push(...defaultValueNotAllowedForRequiredProperties(schema.items, options, { path: [...path, 'items'] }));
  }

  // Check for allOf schemas
  if (schema.allOf && Array.isArray(schema.allOf)) {
    for (const [index, value] of schema.allOf.entries()) {
      errors.push(...defaultValueNotAllowedForRequiredProperties(value, options, { path: [...path, 'allOf', index] }));
    }
  }

  return errors;
}
