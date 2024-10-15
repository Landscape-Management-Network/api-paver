import assert from 'node:assert';

import type { Spectral } from '@stoplight/spectral-core';
import { DiagnosticSeverity } from '@stoplight/types';
import { expect } from 'chai';

import { loadRuleset, openApiSpec } from './testHelpers.js';

const ruleErrorCode = 'lmn-property-description';

describe(ruleErrorCode, () => {
  let spectral: Spectral;

  before(async () => {
    spectral = await loadRuleset();
  });

  it('should pass when all schema properties have descriptions', async () => {
    const spec = {
      ...openApiSpec,
      components: {
        schemas: {
          ExampleSchema: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'Unique identifier of the object',
              },
              name: {
                type: 'string',
                description: 'Name of the object',
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

  it('should fail when a schema property is missing a description', async () => {
    const spec = {
      ...openApiSpec,
      components: {
        schemas: {
          ExampleSchema: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'Unique identifier of the object',
              },
              name: {
                type: 'string',
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
    expect(error.message).to.equal('Property should have a description.');
    expect(error.severity).to.equal(DiagnosticSeverity.Warning);
    expect(error.path).to.include('name');
  });

  it('should pass when properties inside allOf have descriptions', async () => {
    const spec = {
      ...openApiSpec,
      components: {
        schemas: {
          ExampleSchema: {
            allOf: [
              {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    description: 'Unique identifier of the object',
                  },
                  name: {
                    type: 'string',
                    description: 'Name of the object',
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

  it('should fail when properties inside allOf are missing descriptions', async () => {
    const spec = {
      ...openApiSpec,
      components: {
        schemas: {
          ExampleSchema: {
            allOf: [
              {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    description: 'Unique identifier of the object',
                  },
                  name: {
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
    expect(errors.length).to.equal(1);
    const error = errors[0];
    assert(error);
    expect(error.message).to.equal('Property should have a description.');
    expect(error.severity).to.equal(DiagnosticSeverity.Warning);
    expect(error.path).to.include('name');
  });

  it('should pass when properties inside oneOf have descriptions', async () => {
    const spec = {
      ...openApiSpec,
      components: {
        schemas: {
          ExampleSchema: {
            oneOf: [
              {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    description: 'Unique identifier of the object',
                  },
                  name: {
                    type: 'string',
                    description: 'Name of the object',
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

  it('should fail when properties inside oneOf are missing descriptions', async () => {
    const spec = {
      ...openApiSpec,
      components: {
        schemas: {
          ExampleSchema: {
            oneOf: [
              {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                  },
                  name: {
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
    const secondError = errors[1];
    assert(secondError);
    expect(firstError.message).to.equal('Property should have a description.');
    expect(firstError.severity).to.equal(DiagnosticSeverity.Warning);
    expect(firstError.path).to.include('id');
    expect(secondError.message).to.equal('Property should have a description.');
    expect(secondError.severity).to.equal(DiagnosticSeverity.Warning);
    expect(secondError.path).to.include('name');
  });
});
