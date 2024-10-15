import assert from 'node:assert';

import type { Spectral } from '@stoplight/spectral-core';
import { DiagnosticSeverity } from '@stoplight/types';
import { expect } from 'chai';

import { loadRuleset, openApiSpec } from './testHelpers.js';

const ruleErrorCode = 'lmn-property-names-convention';

describe(ruleErrorCode, () => {
  let spectral: Spectral;

  before(async () => {
    spectral = await loadRuleset();
  });

  it('should pass when all properties are snake_case', async () => {
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

  it('should fail when properties are not snake_case', async () => {
    const spec = {
      ...openApiSpec,
      components: {
        schemas: {
          ExampleSchema: {
            type: 'object',
            properties: {
              userId: {
                type: 'string',
              },
              AccountStatus: {
                type: 'string',
              },
            },
          },
        },
      },
    };

    const results = await spectral.run(spec);
    const errors = results.filter((result) => result.code === ruleErrorCode);
    expect(errors.length).to.equal(2);

    const firstError = errors[0];
    assert(firstError);
    expect(firstError.message).to.equal('Property name should be snake case.');
    expect(firstError.severity).to.equal(DiagnosticSeverity.Warning);
    expect(firstError.path).to.include('userId');

    const secondError = errors[1];
    assert(secondError);
    expect(secondError.message).to.equal('Property name should be snake case.');
    expect(secondError.severity).to.equal(DiagnosticSeverity.Warning);
    expect(secondError.path).to.include('AccountStatus');
  });

  it('should pass when properties in allOf are snake_case', async () => {
    const spec = {
      ...openApiSpec,
      components: {
        schemas: {
          ExampleSchema: {
            allOf: [
              {
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
            ],
          },
        },
      },
    };

    const results = await spectral.run(spec);
    const errors = results.filter((result) => result.code === ruleErrorCode);
    expect(errors.length).to.equal(0);
  });

  it('should fail when properties in allOf are not snake_case', async () => {
    const spec = {
      ...openApiSpec,
      components: {
        schemas: {
          ExampleSchema: {
            allOf: [
              {
                type: 'object',
                properties: {
                  userId: {
                    type: 'string',
                  },
                  accountStatus: {
                    type: 'string',
                  },
                },
              },
            ],
          },
        },
      },
    };

    const results = await spectral.run(spec);
    const errors = results.filter((result) => result.code === ruleErrorCode);
    expect(errors.length).to.equal(2);

    const firstError = errors[0];
    assert(firstError);
    expect(firstError.message).to.equal('Property name should be snake case.');
    expect(firstError.severity).to.equal(DiagnosticSeverity.Warning);
    expect(firstError.path).to.include('userId');

    const secondError = errors[1];
    assert(secondError);
    expect(secondError.message).to.equal('Property name should be snake case.');
    expect(secondError.severity).to.equal(DiagnosticSeverity.Warning);
    expect(secondError.path).to.include('accountStatus');
  });

  it('should pass when properties in oneOf are snake_case', async () => {
    const spec = {
      ...openApiSpec,
      components: {
        schemas: {
          ExampleSchema: {
            oneOf: [
              {
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
            ],
          },
        },
      },
    };

    const results = await spectral.run(spec);
    const errors = results.filter((result) => result.code === ruleErrorCode);
    expect(errors.length).to.equal(0);
  });

  it('should fail when properties in oneOf are not snake_case', async () => {
    const spec = {
      ...openApiSpec,
      components: {
        schemas: {
          ExampleSchema: {
            oneOf: [
              {
                type: 'object',
                properties: {
                  userId: {
                    type: 'string',
                  },
                  accountStatus: {
                    type: 'string',
                  },
                },
              },
            ],
          },
        },
      },
    };

    const results = await spectral.run(spec);
    const errors = results.filter((result) => result.code === ruleErrorCode);
    expect(errors.length).to.equal(2);

    const firstError = errors[0];
    assert(firstError);
    expect(firstError.message).to.equal('Property name should be snake case.');
    expect(firstError.severity).to.equal(DiagnosticSeverity.Warning);
    expect(firstError.path).to.include('userId');

    const secondError = errors[1];
    assert(secondError);
    expect(secondError.message).to.equal('Property name should be snake case.');
    expect(secondError.severity).to.equal(DiagnosticSeverity.Warning);
    expect(secondError.path).to.include('accountStatus');
  });
});
