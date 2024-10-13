import assert from 'node:assert';

import type { Spectral } from '@stoplight/spectral-core';
import { DiagnosticSeverity } from '@stoplight/types';
import { expect } from 'chai';

import { loadRuleset, openApiSpec } from './testHelpers.js'; // Assuming helpers like loading Spectral and the openApiSpec are already defined

const ruleErrorCode = 'lmn-204-no-response-body';

describe(ruleErrorCode, () => {
  let spectral: Spectral;

  before(async () => {
    spectral = await loadRuleset();
  });

  it('should fail when 204 response has a response body', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/test': {
          delete: {
            responses: {
              '204': {
                description: 'No Content',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
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
    };

    const results = await spectral.run(spec);
    const errors = results.filter((result) => result.code === ruleErrorCode);

    expect(errors.length).to.equal(1);
    const error = errors[0];
    assert(error);
    expect(error.severity).to.equal(DiagnosticSeverity.Warning);
    expect(error.path).to.include('/test');
  });

  it('should pass when 204 response has no response body', async () => {
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
});
