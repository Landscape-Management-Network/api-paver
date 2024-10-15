import assert from 'node:assert';

import type { Spectral } from '@stoplight/spectral-core';
import { DiagnosticSeverity } from '@stoplight/types';
import { expect } from 'chai';

import { loadRuleset, openApiSpec } from './testHelpers.js';

const ruleErrorCode = 'lmn-readonly-properties-in-response-only-schema';

describe(ruleErrorCode, () => {
  let spectral: Spectral;

  before(async () => {
    spectral = await loadRuleset();
  });

  it('should pass when properties in request schemas are marked as readOnly', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/example': {
          post: {
            parameters: [
              {
                in: 'body',
                name: 'exampleRequest',
                schema: {
                  $ref: '#/definitions/ExampleRequest',
                },
              },
            ],
            responses: {
              '200': {
                description: 'Success',
              },
            },
          },
        },
      },
      definitions: {
        ExampleRequest: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              readOnly: true,
            },
          },
        },
      },
    };

    const results = await spectral.run(spec);
    const errors = results.filter((result) => result.code === ruleErrorCode);
    expect(errors.length).to.equal(0);
  });

  it('should fail when properties in response-only schemas are marked as readOnly', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/example': {
          get: {
            responses: {
              '200': {
                description: 'Success',
                schema: {
                  $ref: '#/definitions/ExampleResponse',
                },
              },
            },
          },
        },
      },
      definitions: {
        ExampleResponse: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              readOnly: true,
            },
          },
        },
      },
    };

    const results = await spectral.run(spec);
    const errors = results.filter((result) => result.code === ruleErrorCode);
    expect(errors.length).to.equal(1);

    const error = errors[0];
    assert(error);
    expect(error.message).to.equal('Property of response-only schema should not be marked readOnly');
    expect(error.severity).to.equal(DiagnosticSeverity.Warning);
    expect(error.path).to.include('id');
  });

  it('should pass when properties in response-only schemas are not marked as readOnly', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/example': {
          get: {
            responses: {
              '200': {
                description: 'Success',
                schema: {
                  $ref: '#/definitions/ExampleResponse',
                },
              },
            },
          },
        },
      },
      definitions: {
        ExampleResponse: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              readOnly: false,
            },
          },
        },
      },
    };

    const results = await spectral.run(spec);
    const errors = results.filter((result) => result.code === ruleErrorCode);
    expect(errors.length).to.equal(0);
  });

  it('should pass when schema is referenced in both request and response', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/example': {
          post: {
            parameters: [
              {
                in: 'body',
                name: 'exampleRequest',
                schema: {
                  $ref: '#/definitions/ExampleRequestResponse',
                },
              },
            ],
            responses: {
              '200': {
                description: 'Success',
                schema: {
                  $ref: '#/definitions/ExampleRequestResponse',
                },
              },
            },
          },
        },
      },
      definitions: {
        ExampleRequestResponse: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              readOnly: true,
            },
          },
        },
      },
    };

    const results = await spectral.run(spec);
    const errors = results.filter((result) => result.code === ruleErrorCode);
    expect(errors.length).to.equal(0);
  });

  it('should pass when there are no readOnly properties in response-only schemas', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/example': {
          get: {
            responses: {
              '200': {
                description: 'Success',
                schema: {
                  $ref: '#/definitions/ExampleResponse',
                },
              },
            },
          },
        },
      },
      definitions: {
        ExampleResponse: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
            },
          },
        },
      },
    };

    const results = await spectral.run(spec);
    const errors = results.filter((result) => result.code === ruleErrorCode);
    expect(errors.length).to.equal(0);
  });
});
