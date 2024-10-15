import assert from 'node:assert';

import type { Spectral } from '@stoplight/spectral-core';
import { DiagnosticSeverity } from '@stoplight/types';
import { expect } from 'chai';

import { loadRuleset, openApiSpec } from './testHelpers.js';

const ruleErrorCode = 'lmn-schema-names-convention';

describe(ruleErrorCode, () => {
  let spectral: Spectral;

  before(async () => {
    spectral = await loadRuleset();
  });

  it('should fail when schema name is not Pascal case', async () => {
    const spec = {
      ...openApiSpec,
      components: {
        schemas: {
          testSchema: {
            type: 'object',
            properties: {
              foo: { type: 'string' },
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
    assert.strictEqual(error.message, 'Schema name should be Pascal case.');
    assert.strictEqual(error.severity, DiagnosticSeverity.Warning);
    expect(error.path).to.include('components');
    expect(error.path).to.include('schemas');
    expect(error.path).to.include('testSchema');
  });

  it('should pass when schema name is Pascal case', async () => {
    const spec = {
      ...openApiSpec,
      components: {
        schemas: {
          TestSchema: {
            type: 'object',
            properties: {
              foo: { type: 'string' },
            },
          },
        },
      },
    };

    const results = await spectral.run(spec);
    const errors = results.filter((result) => result.code === ruleErrorCode);
    expect(errors.length).to.equal(0);
  });

  it('should pass when schema name includes a dot and follows Pascal case', async () => {
    const spec = {
      ...openApiSpec,
      components: {
        schemas: {
          'Test.Schema': {
            type: 'object',
            properties: {
              foo: { type: 'string' },
            },
          },
        },
      },
    };

    const results = await spectral.run(spec);
    const errors = results.filter((result) => result.code === ruleErrorCode);
    expect(errors.length).to.equal(0);
  });

  it('should fail when schema name has lowercase start', async () => {
    const spec = {
      ...openApiSpec,
      components: {
        schemas: {
          schemaName: {
            type: 'object',
            properties: {
              foo: { type: 'string' },
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
    assert.strictEqual(error.message, 'Schema name should be Pascal case.');
    assert.strictEqual(error.severity, DiagnosticSeverity.Warning);
    expect(error.path).to.include('components');
    expect(error.path).to.include('schemas');
    expect(error.path).to.include('schemaName');
  });

  it('should fail when schema name contains special characters', async () => {
    const spec = {
      ...openApiSpec,
      components: {
        schemas: {
          Test_Schema: {
            type: 'object',
            properties: {
              foo: { type: 'string' },
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
    assert.strictEqual(error.message, 'Schema name should be Pascal case.');
    assert.strictEqual(error.severity, DiagnosticSeverity.Warning);
    expect(error.path).to.include('components');
    expect(error.path).to.include('schemas');
    expect(error.path).to.include('Test_Schema');
  });

  it('should pass when schema name is Pascal case but contains numbers', async () => {
    const spec = {
      ...openApiSpec,
      components: {
        schemas: {
          TestSchema1: {
            type: 'object',
            properties: {
              foo: { type: 'string' },
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
