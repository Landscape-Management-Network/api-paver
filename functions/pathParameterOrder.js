/**
 * Validate that path parameters are in the same order as they appear in the path string.
 *
 * NOTE: Missing path parameters will be flagged by pathParameters rule.
 *
 * @param {object} paths
 * @returns {Array} List of errors if path parameters are out of order.
 */
export default function pathParameterOrder(paths) {
  if (paths === null || typeof paths !== 'object') {
    return [];
  }

  function inPath(param) {
    return param.in === 'path';
  }

  const methods = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'];

  const errors = [];

  // Iterate over each path key in the OpenAPI paths object
  for (const pathKey of Object.keys(paths)) {
    const paramsInPath = pathKey.match(/[^{}]+(?=})/g) ?? [];
    if (paramsInPath.length > 0) {
      const pathItem = paths[pathKey];
      const pathItemPathParams = pathItem.parameters?.filter((param) => inPath(param)).map((param) => param.name) ?? [];

      // Check if path parameters are in the correct order
      const inconsistentIndex = pathItemPathParams.findIndex((pathParamName, index) => pathParamName !== paramsInPath[index]);

      if (inconsistentIndex >= 0 && inconsistentIndex < paramsInPath.length) {
        errors.push({
          message: `Path parameter "${paramsInPath[inconsistentIndex]}" should appear before "${pathItemPathParams[inconsistentIndex]}".`,
          path: ['paths', pathKey, 'parameters'],
        });
      } else {
        // Check if method-level parameters are consistent with the path order
        const offset = pathItemPathParams.length;
        for (const method of methods) {
          if (pathItem[method]) {
            const pathParamNames = pathItem[method].parameters?.filter((param) => inPath(param)).map((param) => param.name) ?? [];
            const methodInconsistentIndex = pathParamNames.findIndex((pathParamName, index) => pathParamName !== paramsInPath[offset + index]);

            if (methodInconsistentIndex >= 0 && offset + methodInconsistentIndex < paramsInPath.length) {
              errors.push({
                message: `Path parameter "${paramsInPath[offset + methodInconsistentIndex]}" should appear before "${pathParamNames[methodInconsistentIndex]}".`,
                path: ['paths', pathKey, method, 'parameters'],
              });
            }
          }
        }
      }
    }
  }

  return errors;
}
