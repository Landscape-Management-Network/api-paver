/**
 * Custom Spectral rule to check if a version identifier (e.g., v1, v2) is included in the URL path.
 *
 * @param {object} targetVal - The path object being evaluated.
 * @param {object} _options
 * @param {object} context - The context object containing path and other validation details.
 * @returns {Array} List of errors if the URL path does not contain a version identifier.
 */
export default function apiVersion(targetVal, _options, context) {
  const errors = [];
  const versionRegex = /^\/v\d+(\/|$)/;

  if (!versionRegex.test(context.path[1])) {
    errors.push({
      message: 'The path should contain a version identifier (e.g., /v1/ or /v2/).',
      path: context.path,
    });
  }

  return errors;
}
