import assert from 'node:assert';

import type { Spectral } from '@stoplight/spectral-core';
import { DiagnosticSeverity } from '@stoplight/types';
import { expect } from 'chai';

import { loadRuleset, openApiSpec } from './testHelpers.js';

const ruleErrorCode = 'lmn-error-response';

describe(ruleErrorCode, () => {
  let spectral: Spectral;

  before(async () => {
    spectral = await loadRuleset();
  });

  it('should pass when error response body conforms to guidelines', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/test': {
          get: {
            responses: {
              '400': {
                description: 'Bad Request',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      required: ['error'],
                      properties: {
                        error: {
                          type: 'object',
                          required: ['message', 'code'],
                          properties: {
                            message: { type: 'string' },
                            code: { type: 'string' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    const results = await spectral.run(spec);
    const errors = results.filter((result) => result.code === ruleErrorCode);
    expect(errors.length).to.equal(0);
  });

  it('should fail when error response body is missing "error" field', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/test': {
          get: {
            responses: {
              '400': {
                description: 'Bad Request',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        message: { type: 'string' },
                        code: { type: 'string' },
                      },
                    },
                  },
                },
              },
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
    expect(error.severity).to.equal(DiagnosticSeverity.Warning);
    expect(error.message).to.equal('Error response body must contain an object property named `error` having `message` and `code` properties.');
    expect(error.path).to.include('/test');
  });

  it('should fail when "error" field is missing required "message" field', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/test': {
          get: {
            responses: {
              '400': {
                description: 'Bad Request',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      required: ['error'],
                      properties: {
                        error: {
                          type: 'object',
                          required: ['message', 'code'],
                          properties: {
                            code: { type: 'string' },
                          },
                        },
                      },
                    },
                  },
                },
              },
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
    expect(error.severity).to.equal(DiagnosticSeverity.Warning);
    expect(error.message).to.equal('Error schema should contain `message` property.');
    expect(error.path).to.include('/test');
  });

  it('should fail when "error" field is missing required "code" field', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/test': {
          get: {
            responses: {
              '400': {
                description: 'Bad Request',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      required: ['error'],
                      properties: {
                        error: {
                          type: 'object',
                          required: ['message', 'code'],
                          properties: {
                            message: { type: 'string' },
                          },
                        },
                      },
                    },
                  },
                },
              },
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
    expect(error.severity).to.equal(DiagnosticSeverity.Warning);
    expect(error.message).to.equal('Error schema should contain `code` property.');
    expect(error.path).to.include('/test');
  });

  it('should pass when multiple response codes conform to error response guidelines', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/test': {
          get: {
            responses: {
              '400': {
                description: 'Bad Request',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      required: ['error'],
                      properties: {
                        error: {
                          type: 'object',
                          required: ['message', 'code'],
                          properties: {
                            message: { type: 'string' },
                            code: { type: 'string' },
                          },
                        },
                      },
                    },
                  },
                },
              },
              '500': {
                description: 'Internal Server Error',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      required: ['error'],
                      properties: {
                        error: {
                          type: 'object',
                          required: ['message', 'code'],
                          properties: {
                            message: { type: 'string' },
                            code: { type: 'string' },
                          },
                        },
                      },
                    },
                  },
                },
              },
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
