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
    expect(error.severity).to.equal(DiagnosticSeverity.Warning);
    expect(error.message).to.equal('Schema name should be Pascal case.');
    expect(error.path).to.contain('testSchema');
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
    expect(error.severity).to.equal(DiagnosticSeverity.Warning);
    expect(error.message).to.equal('Schema name should be Pascal case.');
    expect(error.path).to.contain('schemaName');
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
    expect(error.severity).to.equal(DiagnosticSeverity.Warning);
    expect(error.message).to.equal('Schema name should be Pascal case.');
    expect(error.path).to.contain('Test_Schema');
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
