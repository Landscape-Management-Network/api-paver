function isArraySchema(schema) {
  return schema.type === 'array' || !!schema.items;
}

function isObjectSchema(schema) {
  return schema.type === 'object' || !!schema.properties || !!schema.$ref;
}

/**
 * Validate that the schema conforms to API guidelines.
 */
function validateErrorResponseSchema(errorResponseSchema, pathToSchema) {
  const errors = [];

  if (!errorResponseSchema.properties) {
    errors.push({
      message: 'Error response schema must be an object schema.',
      path: pathToSchema,
    });
    return errors;
  }

  if (!errorResponseSchema.properties.error || !errorResponseSchema.properties.error.properties) {
    errors.push({
      message: 'Error response body must contain an object property named `error` having `message` and `code` properties.',
      path: [...pathToSchema, 'properties', 'error'],
    });
    return errors;
  }

  if (!errorResponseSchema.required?.includes?.('error')) {
    errors.push({
      message: 'The `error` property in the error response schema should be required.',
      path: [...pathToSchema, 'required'],
    });
  }

  const errorSchema = errorResponseSchema.properties.error;
  const pathToErrorSchema = [...pathToSchema, 'properties', 'error'];

  const hasCode = !!errorSchema.properties.code;
  const hasMessage = !!errorSchema.properties.message;

  if (!hasCode && hasMessage) {
    errors.push({
      message: 'Error schema should contain `code` property.',
      path: [...pathToErrorSchema, 'properties'],
    });
  } else if (hasCode && !hasMessage) {
    errors.push({
      message: 'Error schema should contain `message` property.',
      path: [...pathToErrorSchema, 'properties'],
    });
  } else if (!hasCode && !hasMessage) {
    errors.push({
      message: 'Error schema should contain `code` and `message` properties.',
      path: [...pathToErrorSchema, 'properties'],
    });
  }

  if (hasCode && errorSchema.properties.code.type !== 'string') {
    errors.push({
      message: 'The `code` property of error schema should be type `string`.',
      path: [...pathToErrorSchema, 'properties', 'code', 'type'],
    });
  }

  if (hasMessage && errorSchema.properties.message.type !== 'string') {
    errors.push({
      message: 'The `message` property of error schema should be type `string`.',
      path: [...pathToErrorSchema, 'properties', 'message', 'type'],
    });
  }

  if (['code', 'message'].every((prop) => !errorSchema.required?.includes?.(prop))) {
    errors.push({
      message: 'Error schema should define `code` and `message` properties as required.',
      path: [...pathToErrorSchema, 'required'],
    });
  } else if (!errorSchema.required.includes('code')) {
    errors.push({
      message: 'Error schema should define `code` property as required.',
      path: [...pathToErrorSchema, 'required'],
    });
  } else if (!errorSchema.required.includes('message')) {
    errors.push({
      message: 'Error schema should define `message` property as required.',
      path: [...pathToErrorSchema, 'required'],
    });
  }

  if (!!errorSchema.properties.target && errorSchema.properties.target.type !== 'string') {
    errors.push({
      message: 'The `target` property of the error schema should be type `string`.',
      path: [...pathToErrorSchema, 'properties', 'target'],
    });
  }

  if (!!errorSchema.properties.details && !isArraySchema(errorSchema.properties.details)) {
    errors.push({
      message: 'The `details` property of the error schema should be an array.',
      path: [...pathToErrorSchema, 'properties', 'details'],
    });
  }

  if (!!errorSchema.properties.innererror && !isObjectSchema(errorSchema.properties.innererror)) {
    errors.push({
      message: 'The `innererror` property of the error schema should be an object.',
      path: [...pathToErrorSchema, 'properties', 'innererror'],
    });
  }

  return errors;
}

/**
 * Validate error response.
 */
function validateErrorResponse(response, responsePath, isOas3) {
  const errors = [];

  if (!response) {
    return errors;
  }

  let errorResponseSchema;

  // OAS2 schema location
  if (!isOas3 && response.schema) {
    errorResponseSchema = response.schema;
  }

  // OAS3 schema location
  if (isOas3 && response.content?.['application/json']?.schema) {
    errorResponseSchema = response.content['application/json'].schema;
  }

  if (errorResponseSchema) {
    errors.push(...validateErrorResponseSchema(errorResponseSchema, [...responsePath, 'schema']));
  } else {
    const method = responsePath[responsePath.length - 3];
    if (method !== 'head') {
      errors.push({
        message: 'Error response should have a schema.',
        path: responsePath,
      });
    }
  }

  return errors;
}

/**
 * Validate that the error response body conforms to LMN API Guidelines.
 *
 * Check that:
 * - For all error responses (4xx and 5xx), the response body must contain an "error" object.
 * - The "error" object must contain both "message" and "code" properties.
 * - For OAS3, the schema should be located under content['application/json'].schema.
 * - For OAS2, the schema is located under responses[*].schema.
 */
export default function errorResponse(responses, _opts, { path, document }) {
  const errors = [];
  const isOas3 = document.data.openapi?.startsWith('3.') || false;
  if (responses.default) {
    errors.push(...validateErrorResponse(responses.default, [...path, 'default'], isOas3));
  }

  for (const code of Object.keys(responses)) {
    if (/[45]\d\d/.test(code)) {
      errors.push(...validateErrorResponse(responses[code], [...path, code], isOas3));
    }
  }

  return errors;
}
