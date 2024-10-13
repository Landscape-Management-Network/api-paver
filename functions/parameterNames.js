/**
 * Validate that path and query parameters follow snake_case and header parameters use kebab-case.
 *
 * @param {object} targetVal
 * @param {object} _options
 * @param {object} context
 * @returns {Array} List of errors if naming conventions are violated.
 */
export default function validateParameterNaming(targetVal, _options, context) {
  if (targetVal === null || typeof targetVal !== 'object') {
    return [];
  }

  const { path } = context;

  // Ignore if "in" or "name" is not defined
  if (!targetVal.in || !targetVal.name) {
    return [];
  }

  const errors = [];

  // Validate that parameter names do not begin with '$' or '@'
  if (targetVal.name.match(/^[$@]/)) {
    errors.push({
      message: `Parameter name "${targetVal.name}" should not begin with '$' or '@'.`,
      path: [...path, 'name'],
    });
  }

  // Check snake_case for path and query parameters
  if (['path', 'query'].includes(targetVal.in)) {
    if (!targetVal.name.match(/^[\d_a-z]+$/)) {
      errors.push({
        message: `Parameter name "${targetVal.name}" should be snake_case.`,
        path: [...path, 'name'],
      });
    }
  }

  // Check kebab-case for header parameters
  if (targetVal.in === 'header') {
    // eslint-disable-next-line security/detect-unsafe-regex
    if (!targetVal.name.match(/^([A-Z][\da-z]*)(-[A-Z][\da-z]*)*$/)) {
      errors.push({
        message: `Header parameter name "${targetVal.name}" should be kebab-case with capitalized first letters (e.g., 'Api-Version').`,
        path: [...path, 'name'],
      });
    }
  }

  return errors;
}
