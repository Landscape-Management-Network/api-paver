/**
 * Validate that path parameter names are consistent across all paths.
 * Specifically:
 * - The path parameter that follows a static path segment must be the same across all paths.
 *
 * @param {object} paths - The paths object from the OpenAPI specification.
 * @returns {Array} List of errors if path parameter names are inconsistent for the same static path segment.
 */
export default function pathParameterNames(paths) {
  if (paths === null || typeof paths !== 'object') {
    return [];
  }

  const errors = [];

  // Dictionary to store the parameter name associated with a static path segment
  const paramNameForSegment = {};

  // Iterate over all paths in the specification
  for (const pathKey of Object.keys(paths)) {
    // Split the path into its segments (excluding the leading '/')
    const pathSegments = pathKey.split('/').slice(1);

    // Iterate over the path segments, looking for parameters (identified by curly braces)
    pathSegments.slice(1).forEach((segment, index) => {
      if (segment.includes('}')) {
        // Extract the parameter name (inside the curly braces)
        const paramName = segment.match(/[^{}]+(?=})/)[0];
        // Get the preceding static path segment
        const precedingSegment = pathSegments[index];

        // Check for inconsistent parameter names following the same static segment
        if (paramNameForSegment[precedingSegment]) {
          if (paramNameForSegment[precedingSegment] !== paramName) {
            errors.push({
              message: `Inconsistent parameter names "${paramNameForSegment[precedingSegment]}" and "${paramName}" for path segment "${precedingSegment}".`,
              path: ['paths', pathKey],
            });
          }
        } else {
          // Store the first occurrence of the parameter name for the static segment
          paramNameForSegment[precedingSegment] = paramName;
        }
      }
    });
  }

  return errors;
}
