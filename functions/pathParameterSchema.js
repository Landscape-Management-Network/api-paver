const URL_MAX_LENGTH = 2083;

/**
 * Validate that path parameters are properly defined for PUT and PATCH operations that return a 201 status code.
 * Specifically:
 * - Path parameters should be of type string.
 * - Path parameters should specify a maxLength less than 2083 and a pattern for allowed characters.
 *
 * @param {object} param
 * @param {object} _options
 * @param {object} context
 * @returns {Array} List of errors if path parameter definitions do not conform to best practices.
 */
export default function validatePathParamSchema(param, _options, context) {
  if (param === null || typeof param !== 'object') {
    return [];
  }

  const path = context.path || context.target || [];

  // These errors will be caught elsewhere, so silently ignore here
  if (!param.in || !param.name) {
    return [];
  }

  const errors = [];

  // If the parameter contains a schema, it's OAS3
  const isOas3 = !!param.schema;
  const schema = isOas3 ? param.schema : param;
  if (isOas3) {
    path.push('schema');
  }

  // Ensure the parameter is of type string
  if (schema.type !== 'string') {
    errors.push({
      message: 'Path parameter should be defined as type: string.',
      path: [...path, 'type'],
    });
  }

  // Apply the rule only for path parameters in PUT or PATCH operations that return a 201 response
  const apiPath = path[1] ?? '';
  if (!apiPath.endsWith(`{${param.name}}`)) {
    return errors;
  }

  if (!['put', 'patch'].includes(path[2] ?? '')) {
    return errors;
  }

  const oasDoc = context.document.data;
  const { responses } = oasDoc.paths[apiPath][path[2]];
  if (!responses || !responses['201']) {
    return errors;
  }

  // Check for maxLength and pattern in path parameters
  if (!schema.maxLength && !schema.pattern) {
    errors.push({
      message: 'Path parameter should specify a maximum length (maxLength) and characters allowed (pattern).',
      path,
    });
  } else if (!schema.maxLength) {
    errors.push({
      message: 'Path parameter should specify a maximum length (maxLength).',
      path,
    });
  } else if (schema.maxLength && schema.maxLength >= URL_MAX_LENGTH) {
    errors.push({
      message: `Path parameter maximum length should be less than ${URL_MAX_LENGTH}`,
      path: [...path, 'maxLength'],
    });
  } else if (!schema.pattern) {
    errors.push({
      message: 'Path parameter should specify characters allowed (pattern).',
      path,
    });
  }

  return errors;
}
