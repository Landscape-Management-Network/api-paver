/**
 * Custom function to validate that parameters have a description.
 * It checks the description on the parameter itself and, if missing, looks into the schema for a description.
 *
 * @param {object} param - The parameter object being validated.
 * @param {object} _options - The options for the rule (not used here).
 * @param {object} context - The context object containing path and other details.
 * @returns {Array} - An array of errors if the description is missing.
 */
export default function parameterDescription(param, _options, context) {
  const { path } = context;

  if (param.description) {
    return [];
  }

  if (param.schema?.description) {
    return [];
  }

  return [
    {
      message: 'Parameter should have a description.',
      path,
    },
  ];
}
