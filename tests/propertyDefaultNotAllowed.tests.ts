import assert from 'node:assert';

import type { Spectral } from '@stoplight/spectral-core';
import { DiagnosticSeverity } from '@stoplight/types';
import { expect } from 'chai';

import { loadRuleset, openApiSpec } from './testHelpers.js';

const ruleErrorCode = 'lmn-property-default-not-allowed';

describe(ruleErrorCode, () => {
  let spectral: Spectral;

  before(async () => {
    spectral = await loadRuleset();
  });

  it('should pass when required properties have no default value', async () => {
    const spec = {
      ...openApiSpec,
      components: {
        schemas: {
          ExampleSchema: {
            type: 'object',
            required: ['foo'],
            properties: {
              foo: {
                type: 'string',
              },
            },
          },
        },
      },
      paths: {
        '/test': {
          post: {
            requestBody: {
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ExampleSchema' },
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

  it('should fail when required property has a default value', async () => {
    const spec = {
      ...openApiSpec,
      components: {
        schemas: {
          ExampleSchema: {
            type: 'object',
            required: ['foo'],
            properties: {
              foo: {
                type: 'string',
                default: 'bar',
              },
            },
          },
        },
      },
      paths: {
        '/test': {
          post: {
            requestBody: {
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ExampleSchema' },
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
    expect(error.message).to.equal('Schema property "foo" is required and cannot have a default value.');
  });

  it('should pass when optional property has a default value', async () => {
    const spec = {
      ...openApiSpec,
      components: {
        schemas: {
          ExampleSchema: {
            type: 'object',
            properties: {
              foo: {
                type: 'string',
                default: 'bar',
              },
            },
          },
        },
      },
      paths: {
        '/test': {
          post: {
            requestBody: {
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ExampleSchema' },
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

  it('should fail for nested required property with default value', async () => {
    const spec = {
      ...openApiSpec,
      components: {
        schemas: {
          ParentSchema: {
            type: 'object',
            properties: {
              nested: {
                type: 'object',
                required: ['foo'],
                properties: {
                  foo: {
                    type: 'string',
                    default: 'bar',
                  },
                },
              },
            },
          },
        },
      },
      paths: {
        '/test': {
          post: {
            requestBody: {
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ParentSchema' },
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
    expect(error.message).to.equal('Schema property "foo" is required and cannot have a default value.');
    expect(error.path).to.include('foo');
  });

  it('should pass when required properties exist in array items but have no default value', async () => {
    const spec = {
      ...openApiSpec,
      components: {
        schemas: {
          ExampleArraySchema: {
            type: 'array',
            items: {
              type: 'object',
              required: ['foo'],
              properties: {
                foo: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
      paths: {
        '/test': {
          post: {
            requestBody: {
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ExampleArraySchema' },
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

  it('should fail when required properties in array items have default value', async () => {
    const spec = {
      ...openApiSpec,
      components: {
        schemas: {
          ExampleArraySchema: {
            type: 'array',
            items: {
              type: 'object',
              required: ['foo'],
              properties: {
                foo: {
                  type: 'string',
                  default: 'bar',
                },
              },
            },
          },
        },
      },
      paths: {
        '/test': {
          post: {
            requestBody: {
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ExampleArraySchema' },
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
    expect(error.message).to.equal('Schema property "foo" is required and cannot have a default value.');
    expect(error.path).to.include('items');
  });
});
