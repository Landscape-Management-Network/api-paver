import assert from 'node:assert';

import type { Spectral } from '@stoplight/spectral-core';
import { DiagnosticSeverity } from '@stoplight/types';
import { expect } from 'chai';

import { loadRuleset, openApiSpec } from './testHelpers.js';

const ruleErrorCode = 'lmn-parameter-description';

describe('lmn-parameter-description rule', () => {
  let spectral: Spectral;

  before(async () => {
    spectral = await loadRuleset();
  });

  it('should pass when all parameters have descriptions', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/test': {
          get: {
            parameters: [
              {
                name: 'status',
                in: 'query',
                description: 'Status of the entity',
                schema: {
                  type: 'string',
                },
              },
            ],
            responses: {
              '200': {
                description: 'Success',
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

  it('should fail when a parameter is missing a description', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/test': {
          get: {
            parameters: [
              {
                name: 'status',
                in: 'query',
                schema: {
                  type: 'string',
                },
              },
            ],
            responses: {
              '200': {
                description: 'Success',
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
    expect(error.path).to.include('parameters');
  });

  it('should pass when parameter description is within the schema', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/test': {
          get: {
            parameters: [
              {
                name: 'status',
                in: 'query',
                schema: {
                  type: 'string',
                  description: 'Status of the entity',
                },
              },
            ],
            responses: {
              '200': {
                description: 'Success',
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
