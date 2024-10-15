import assert from 'node:assert';

import type { Spectral } from '@stoplight/spectral-core';
import { DiagnosticSeverity } from '@stoplight/types';
import { expect } from 'chai';

import { loadRuleset, openApiSpec } from './testHelpers.js';

const ruleErrorCode = 'lmn-property-type';

describe(ruleErrorCode, () => {
  let spectral: Spectral;

  before(async () => {
    spectral = await loadRuleset();
  });

  it('should pass when all properties have a defined type', async () => {
    const spec = {
      ...openApiSpec,
      components: {
        schemas: {
          ExampleSchema: {
            type: 'object',
            properties: {
              user_id: {
                type: 'string',
              },
              account_status: {
                type: 'string',
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

  it('should fail when a property does not have a defined type', async () => {
    const spec = {
      ...openApiSpec,
      components: {
        schemas: {
          ExampleSchema: {
            type: 'object',
            properties: {
              user_id: {
                type: 'string',
              },
              account_status: {
                // No type defined
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
    expect(error.message).to.equal('Property should have a defined type.');
    expect(error.severity).to.equal(DiagnosticSeverity.Warning);
    expect(error.path).to.include('account_status');
  });

  it('should pass when properties contain allOf, oneOf, or anyOf', async () => {
    const spec = {
      ...openApiSpec,
      components: {
        schemas: {
          ExampleSchema: {
            type: 'object',
            properties: {
              user_info: {
                allOf: [{ $ref: '#/components/schemas/UserBase' }, { type: 'object', properties: { email: { type: 'string' } } }],
              },
              role: {
                oneOf: [{ type: 'string', enum: ['admin', 'user'] }, { type: 'null' }],
              },
              permissions: {
                anyOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
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

  it('should fail when a nested property does not have a defined type', async () => {
    const spec = {
      ...openApiSpec,
      components: {
        schemas: {
          ExampleSchema: {
            type: 'object',
            properties: {
              user_id: {
                type: 'string',
              },
              details: {
                type: 'object',
                properties: {
                  first_name: {
                    type: 'string',
                  },
                  last_name: {
                    // No type defined
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
    expect(error.message).to.equal('Property should have a defined type.');
    expect(error.severity).to.equal(DiagnosticSeverity.Warning);
    expect(error.path).to.include('last_name');
  });

  it('should pass when properties are referenced with $ref', async () => {
    const spec = {
      ...openApiSpec,
      components: {
        schemas: {
          ExampleSchema: {
            type: 'object',
            properties: {
              user_info: {
                $ref: '#/components/schemas/UserInfo',
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
