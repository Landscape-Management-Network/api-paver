import assert from 'node:assert';

import type { Spectral } from '@stoplight/spectral-core';
import { DiagnosticSeverity } from '@stoplight/types';
import { expect } from 'chai';

import { loadRuleset, openApiSpec } from './testHelpers.js';

const ruleErrorCode = 'lmn-datetime-naming-convention';

describe(ruleErrorCode, () => {
  let spectral: Spectral;

  before(async () => {
    spectral = await loadRuleset();
  });

  it('should pass when date-time properties end with "_at"', async () => {
    const spec = {
      ...openApiSpec,
      components: {
        schemas: {
          ExampleSchema: {
            type: 'object',
            properties: {
              created_at: {
                type: 'string',
                format: 'date-time',
              },
              updated_at: {
                type: 'string',
                format: 'date-time',
              },
            },
          },
        },
      },
      paths: {
        '/test': {
          get: {
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ExampleSchema' },
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

  it('should fail when date-time properties do not end with "_at"', async () => {
    const spec = {
      ...openApiSpec,
      components: {
        schemas: {
          ExampleSchema: {
            type: 'object',
            properties: {
              createdAt: {
                type: 'string',
                format: 'date-time',
              },
              updated: {
                type: 'string',
                format: 'date-time',
              },
            },
          },
        },
      },
      paths: {
        '/test': {
          get: {
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ExampleSchema' },
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

    expect(errors.length).to.equal(2);
    const error1 = errors[0];
    const error2 = errors[1];

    assert(error1 && error2);
    expect(error1.severity).to.equal(DiagnosticSeverity.Warning);
    expect(error2.severity).to.equal(DiagnosticSeverity.Warning);

    expect(error1.message).to.equal('Use an "_at" suffix in names of date-time values.');
    expect(error2.message).to.equal('Use an "_at" suffix in names of date-time values.');

    expect(error1.path).to.contain('createdAt');
    expect(error2.path).to.contain('updated');
  });

  it('should fail for nested properties that do not follow the naming convention', async () => {
    const spec = {
      ...openApiSpec,
      components: {
        schemas: {
          ParentSchema: {
            type: 'object',
            properties: {
              nested: {
                type: 'object',
                properties: {
                  creation_date: {
                    type: 'string',
                    format: 'date-time',
                  },
                },
              },
            },
          },
        },
      },
      paths: {
        '/test': {
          get: {
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ParentSchema' },
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
    expect(error.message).to.equal('Use an "_at" suffix in names of date-time values.');
    expect(error.path).to.contain('creation_date');
  });

  it('should pass when no date-time fields are present', async () => {
    const spec = {
      ...openApiSpec,
      components: {
        schemas: {
          ExampleSchema: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
              },
            },
          },
        },
      },
      paths: {
        '/test': {
          get: {
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ExampleSchema' },
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

  it('should fail for multiple invalid date-time properties in different schemas', async () => {
    const spec = {
      ...openApiSpec,
      components: {
        schemas: {
          ExampleSchema1: {
            type: 'object',
            properties: {
              dateCreated: {
                type: 'string',
                format: 'date-time',
              },
            },
          },
          ExampleSchema2: {
            type: 'object',
            properties: {
              modification_time: {
                type: 'string',
                format: 'date-time',
              },
            },
          },
        },
      },
      paths: {
        '/test1': {
          get: {
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ExampleSchema1' },
                  },
                },
              },
            },
          },
        },
        '/test2': {
          get: {
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ExampleSchema2' },
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

    expect(errors.length).to.equal(2);
    const error1 = errors[0];
    const error2 = errors[1];

    assert(error1 && error2);
    expect(error1.severity).to.equal(DiagnosticSeverity.Warning);
    expect(error2.severity).to.equal(DiagnosticSeverity.Warning);

    expect(error1.path).to.contain('dateCreated');
    expect(error2.path).to.contain('modification_time');
  });
});
