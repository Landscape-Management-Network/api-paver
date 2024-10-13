/**
 * Validates pagination parameters, sorting, filtering, and field selection for APIs that use a straightforward syntax.
 *
 * This function checks query parameters such as `limit`, `offset`, `fields`, `sort`, and custom filters
 * (e.g., `status`, `role`) in API requests. It ensures parameters are optional or required as needed,
 * of the correct type, and validates default values where applicable.
 *
 * ### Example Use Cases:
 *
 * **Example 1: Pagination and Fields**
 * - Request to fetch a list of users with pagination and selected fields:
 *   ```
 *   GET /users?limit=10&offset=20&fields=id,name,email
 *   ```
 *   This request fetches up to 10 users, skipping the first 20, and limits the returned fields to `id`, `name`, and `email`.
 *
 * **Example 2: Pagination with Custom Filters**
 * - Request to fetch users filtered by status and role:
 *   ```
 *   GET /users?status=active&role=admin&limit=50
 *   ```
 *   This request fetches up to 50 users who have an active status and the admin role.
 *
 * **Example 3: Sorting**
 * - Request to fetch users sorted by `name` in ascending order and `created_at` in descending order:
 *   ```
 *   GET /users?sort=name asc,created_at desc
 *   ```
 *   This request fetches users sorted by their name in ascending order and creation date in descending order.
 *
 * ### Parameters Validated:
 * - `limit`: Optional, integer. Specifies the maximum number of items to return.
 * - `offset`: Optional, integer. Specifies the number of items to skip before collecting the result set.
 * - `fields`: Optional, string or array of strings. Specifies which fields to include in the response.
 * - `sort`: Optional, string or array of strings. Specifies the fields and order to sort the results by (e.g., `name asc`, `created_at desc`).
 * - Custom filters like `status` and `role`: Optional, used to filter results based on specified conditions.
 *
 * @param {Object} input
 * @param {Object} _options
 * @param {Object} context - The context object containing path and other validation details.
 * @returns {Array|undefined} An array of error objects if validation fails, or undefined if validation succeeds.
 */
export default function paginationParameters(input, _options, context) {
  if (input === null || typeof input !== 'object') {
    return;
  }

  const { path } = context;

  if (!input.parameters?.length) {
    return [
      {
        message: 'Pagination parameters (limit, offset, sort, or fields) are missing.',
        path,
      },
    ];
  }

  const errors = [];

  const paginationParams = new Set(['limit', 'offset', 'sort', 'fields']);
  const foundParams = input.parameters.filter((param) => paginationParams.has(param.name?.toLowerCase()));

  if (!foundParams.length) {
    errors.push({
      message: 'Pagination parameters (limit, offset, sort, or fields) are missing.',
      path,
    });
    return errors;
  }

  // Helper function to check parameter schema type
  function checkParameterType(param, expectedType, paramName, index) {
    const actualType = param.schema?.type;
    if (Array.isArray(expectedType)) {
      if (!expectedType.includes(actualType)) {
        errors.push({
          message: `${paramName} parameter must be of type ${expectedType.join(' or ')}`,
          path: [...path, 'parameters', index, 'schema', 'type'],
        });
      } else if (actualType === 'array' && param.schema.items?.type !== 'string') {
        errors.push({
          message: `${paramName} parameter array items must be of type string`,
          path: [...path, 'parameters', index, 'schema', 'items', 'type'],
        });
      }
    } else if (actualType !== expectedType) {
      errors.push({
        message: `${paramName} parameter must be of type ${expectedType}`,
        path: [...path, 'parameters', index, 'schema', 'type'],
      });
    }
  }

  // Helper function to check if parameter is required or optional
  function checkParameterRequiredOptional(param, paramName, index, isRequired) {
    if (isRequired && !param.required) {
      errors.push({
        message: `${paramName} parameter must be required`,
        path: [...path, 'parameters', index, 'required'],
      });
    } else if (!isRequired && param.required) {
      errors.push({
        message: `${paramName} parameter must be optional`,
        path: [...path, 'parameters', index, 'required'],
      });
    }
  }

  // Helper function to check default value
  function checkDefaultValue(param, expectedDefault, paramName, index) {
    const defaultValue = param.schema?.default;
    if (defaultValue !== expectedDefault) {
      errors.push({
        message: `${paramName} parameter must have a default value of ${expectedDefault}`,
        path: [...path, 'parameters', index, 'schema', 'default'],
      });
    }
  }

  // Helper function to validate sort direction (asc/desc)
  function validateSortDirection(value, paramName, index) {
    const validDirections = ['asc', 'desc'];
    const parts = value.trim().split(/\s+/);

    if (parts.length === 1) {
      return;
    }

    // If there are two parts, the second must be a valid direction
    if (parts.length === 2) {
      const direction = parts[1].toLowerCase();

      if (!validDirections.includes(direction)) {
        errors.push({
          message: `${paramName} parameter must end with either 'asc' or 'desc' if direction is specified.`,
          path: [...path, 'parameters', index, 'schema', 'example'],
        });
      }
    } else if (parts.length > 2) {
      errors.push({
        message: `${paramName} parameter must be in the format 'field asc' or 'field desc'.`,
        path: [...path, 'parameters', index, 'schema', 'example'],
      });
    }
  }

  // List of parameters to check with their expected types, default values, and descriptions
  const parametersToCheck = [
    {
      name: 'limit',
      type: 'integer',
      isRequired: false,
      description: 'Specifies the maximum number of items to return in a single response.',
    },
    {
      name: 'offset',
      type: 'integer',
      isRequired: false,
      defaultValue: 0,
      description: 'Specifies the number of items to skip before starting to collect the result set.',
    },
    {
      name: 'filter',
      type: 'string',
      isRequired: false,
      description: 'Allows filtering of the results based on certain criteria. Typically, this is a string value.',
    },
    {
      name: 'sort',
      type: ['string', 'array'],
      isRequired: false,
      description: "Specifies the order in which results should be returned. Can be a single field or an array of fields, optionally followed by 'asc' or 'desc' to define the sorting direction.",
      validate(param, paramName, index) {
        const schemaType = param.schema?.type;

        if (schemaType === 'string') {
          // If sort is a single string, validate it
          validateSortDirection(param.example || param.schema.example, paramName, index);
        } else if (schemaType === 'array' && param.schema.items?.type === 'string') {
          // If sort is an array, validate each item
          (param.schema.example || []).forEach((item, itemIndex) => {
            validateSortDirection(item, `${paramName}[${itemIndex}]`, index);
          });
        }
      },
    },
    {
      name: 'fields',
      type: ['string', 'array'],
      isRequired: false,
      description: 'Specifies which fields to include in the response. Can be a string or an array of strings.',
    },
  ];

  // Iterate over each parameter to check
  for (const { name, type, isRequired, defaultValue, description, validate } of parametersToCheck) {
    const index = input.parameters.findIndex((param) => param.name?.toLowerCase() === name.toLowerCase());
    if (index !== -1) {
      const param = input.parameters[index];
      checkParameterType(param, type, name, index);
      checkParameterRequiredOptional(param, name, index, isRequired);
      if (defaultValue !== undefined) {
        checkDefaultValue(param, defaultValue, name, index);
      }

      // Add validation to ensure description is present and matches the expected description
      if (!param.description || param.description !== description) {
        errors.push({
          message: `${name} parameter should have the following description: "${description}"`,
          path: [...path, 'parameters', index, 'description'],
        });
      }

      // If the parameter has a custom validator (like sort), run the custom validation
      if (typeof validate === 'function') {
        validate(param, name, index);
      }
    }
  }

  return errors.length > 0 ? errors : undefined;
}
