/**
 * Validate that the request and response body for a PUT operation use the same schema.
 *
 * @param {object} putOperation
 * @param {object} _options
 * @param {object} context
 * @returns {Array} List of errors if the request and response body schemas are not the same.
 */
export default function putRequestResponseSchema(putOperation, _options, context) {
  if (putOperation === null || typeof putOperation !== 'object') {
    return [];
  }

  const path = context.path || context.target || [];
  const errors = [];

  // Resource schema is the response body schema
  const responseBodyRef = putOperation.responses?.['201']?.schema?.$ref || putOperation.responses?.['200']?.schema?.$ref;

  // Request body schema
  const requestBodyRef = putOperation.parameters?.find((param) => param.in === 'body')?.schema?.$ref;

  // Validate that the request and response body schemas are the same
  if (responseBodyRef && requestBodyRef && responseBodyRef !== requestBodyRef) {
    errors.push({
      message: 'A PUT operation should use the same schema for the request and response body.',
      path,
    });
  }

  return errors;
}
