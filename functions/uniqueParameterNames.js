// Return the "canonical" casing for a string (currently lowercase but can be extended for other conventions).
function canonical(name) {
  return typeof name === 'string' ? name.toLowerCase() : name;
}

function getDuplicates(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  const seen = new Set();
  const duplicates = new Set();

  for (const item of items) {
    const canonicalItem = canonical(item);
    if (seen.has(canonicalItem)) {
      duplicates.add(canonicalItem);
    } else {
      seen.add(canonicalItem);
    }
  }

  return [...duplicates];
}

/**
 * Check that the parameters of an operation (including those specified on the path)
 * are case-insensitive unique, regardless of "in" location (path, query, etc.).
 *
 * @param {object} pathItem
 * @param {object} _options
 * @param {object} context
 * @returns {Array} List of errors, if any duplicate parameters (ignoring case) are found.
 */
export default function uniqueParameterNames(pathItem, _options, context) {
  if (pathItem === null || typeof pathItem !== 'object') {
    return [];
  }

  const { path } = context;
  const errors = [];

  // Get all parameters for the path
  const pathParams = pathItem.parameters ? pathItem.parameters.map((param) => param.name) : [];
  const duplicatePathParameters = getDuplicates(pathParams);

  // Report all duplicate path parameters
  for (const dup of duplicatePathParameters) {
    const duplicatePathParamKeys = [];
    for (const key of pathParams.keys()) {
      if (canonical(pathParams[key]) === dup) {
        duplicatePathParamKeys.push(key);
      }
    }

    if (duplicatePathParamKeys.length) {
      const first = `parameters.${duplicatePathParamKeys[0]}`;
      for (const key of duplicatePathParamKeys.slice(1)) {
        errors.push({
          message: `Duplicate parameter name (ignoring case) with ${first}.`,
          path: [...path, 'parameters', key, 'name'],
        });
      }
    }
  }

  // Check for duplicates in each method's parameters
  ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'].forEach((method) => {
    if (pathItem[method] && Array.isArray(pathItem[method].parameters)) {
      const allParams = [...pathParams, ...pathItem[method].parameters.map((param) => param.name)];

      // Check for duplicates across path and method parameters
      const duplicateParameters = getDuplicates(allParams);

      for (const duplicateParameter of duplicateParameters) {
        const duplicatePathParamKeys = [];
        for (const key of allParams.keys()) {
          if (canonical(allParams[key]) === duplicateParameter) {
            duplicatePathParamKeys.push(key);
          }
        }

        const first = duplicatePathParamKeys[0] < pathParams.length ? `parameters.${duplicatePathParamKeys[0]}` : `${method}.parameters.${duplicatePathParamKeys[0] - pathParams.length}`;

        for (const key of duplicatePathParamKeys.slice(1)) {
          if (key >= pathParams.length) {
            errors.push({
              message: `Duplicate parameter name (ignoring case) with ${first}.`,
              path: [...path, method, 'parameters', key - pathParams.length, 'name'],
            });
          }
        }
      }
    }
  });

  return errors;
}
