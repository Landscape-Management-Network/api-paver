import assert from 'node:assert';

import type { Spectral } from '@stoplight/spectral-core';
import { DiagnosticSeverity } from '@stoplight/types';
import { expect } from 'chai';

import { loadRuleset, openApiSpec } from './testHelpers.js';

const ruleErrorCode = 'lmn-schema-description-or-title';

describe(ruleErrorCode, () => {
  let spectral: Spectral;

  before(async () => {
    spectral = await loadRuleset();
  });

  it('should fail when a schema lacks both description and title', async () => {
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

    expect(errors.length).to.equal(1);
    const error = errors[0];
    assert(error);
    expect(error.severity).to.equal(DiagnosticSeverity.Warning);
    expect(error.message).to.equal('Schema should have a description or title.');
    expect(error.path).to.contain('TestSchema');
  });

  it('should pass when a schema has a description', async () => {
    const spec = {
      ...openApiSpec,
      components: {
        schemas: {
          TestSchema: {
            type: 'object',
            description: 'A test schema',
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

  it('should pass when a schema has a title', async () => {
    const spec = {
      ...openApiSpec,
      components: {
        schemas: {
          TestSchema: {
            type: 'object',
            title: 'Test Schema',
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
