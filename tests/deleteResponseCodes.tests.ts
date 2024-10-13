import assert from 'node:assert';

import type { Spectral } from '@stoplight/spectral-core';
import { DiagnosticSeverity } from '@stoplight/types';
import { expect } from 'chai';

import { loadRuleset, openApiSpec } from './testHelpers.js';

const ruleErrorCode = 'lmn-delete-response-codes';

describe(ruleErrorCode, () => {
  let spectral: Spectral;

  before(async () => {
    spectral = await loadRuleset();
  });

  it('should pass when delete operation has a 202 response', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/test': {
          delete: {
            responses: {
              '202': {
                description: 'Accepted',
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

  it('should pass when delete operation has a 204 response', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/test': {
          delete: {
            responses: {
              '204': {
                description: 'No Content',
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

  it('should fail when delete operation has a 200 response', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/test': {
          delete: {
            responses: {
              '200': {
                description: 'OK',
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
    expect(error.message).to.equal('A delete operation should have a `204` response.');
    expect(error.path).to.deep.equal(['paths', '/test', 'delete', 'responses']);
  });

  it('should fail when delete operation has neither 204 nor 202 response', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/test': {
          delete: {
            responses: {
              '404': {
                description: 'Not Found',
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
    expect(error.message).to.equal('A delete operation should have a `204` response.');
    expect(error.path).to.deep.equal(['paths', '/test', 'delete', 'responses']);
  });
});
