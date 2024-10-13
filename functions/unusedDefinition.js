import { unreferencedReusableObject } from '@stoplight/spectral-functions';

function isObject(obj) {
  return obj && typeof obj === 'object';
}

/**
 * Check all definitions in the document to see if they are used.
 * This rule utilizes the spectral `unreferencedReusableObject` function to find unused definitions,
 * and then removes any that are referenced via `allOf` in a used schema.
 *
 * @param {object} given - The object holding the potential reusable definitions.
 * @param {object} options - Options passed to the function (not used here).
 * @param {object} context - The context object containing path and other validation details.
 * @returns {Array} List of unused definitions that are not referenced by other schemas using `allOf`.
 */
export default function unusedDefinition(given, options, context) {
  if (!isObject(given)) {
    return [];
  }

  const opts = {
    reusableObjectsLocation: '#/definitions',
  };

  // Find unused definitions using Spectral's unreferencedReusableObject function
  const unreferencedDefinitionErrors = unreferencedReusableObject(given, opts, context);
  const unusedDefinitions = new Set(unreferencedDefinitionErrors.map((error) => error.path[1]));

  // Helper function to check if a schema uses any `allOf` reference to a used schema
  function allOfsUsedSchema(schemaName) {
    const schema = given[schemaName];
    if (!isObject(schema) || !Array.isArray(schema.allOf)) {
      return false;
    }

    return schema.allOf.some((subSchema) => {
      if (!isObject(subSchema) || !subSchema.$ref) {
        return false;
      }

      // Get the referenced schema name from the $ref
      const reffedSchema = subSchema.$ref.split('/').pop();
      return !unusedDefinitions.has(reffedSchema); // Check if it's not an unused definition
    });
  }

  // Filter out definitions that are referenced by `allOf` from the unused list
  return unreferencedDefinitionErrors.filter((error) => !allOfsUsedSchema(error.path[1]));
}
