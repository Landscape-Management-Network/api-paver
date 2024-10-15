import assert from 'node:assert';

import type { Spectral } from '@stoplight/spectral-core';
import { DiagnosticSeverity } from '@stoplight/types';
import { expect } from 'chai';

import { loadRuleset, openApiSpec } from './testHelpers.js';

const ruleErrorCode = 'lmn-request-body-not-allowed';

describe(ruleErrorCode, () => {
  let spectral: Spectral;

  before(async () => {
    spectral = await loadRuleset();
  });

  it('should fail when a GET operation includes a body parameter', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/test': {
          get: {
            parameters: [
              {
                in: 'body',
                name: 'exampleBody',
                schema: {
                  type: 'object',
                },
              },
            ],
            responses: {
              '200': { description: 'Success' },
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
    expect(error.message).to.equal('A get or delete operation must not accept a body parameter.');
    expect(error.severity).to.equal(DiagnosticSeverity.Error);
    expect(error.path).to.include('/test');
  });

  it('should fail when a DELETE operation includes a body parameter', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/test': {
          delete: {
            parameters: [
              {
                in: 'body',
                name: 'exampleBody',
                schema: {
                  type: 'object',
                },
              },
            ],
            responses: {
              '204': { description: 'No Content' },
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
    expect(error.message).to.equal('A get or delete operation must not accept a body parameter.');
    expect(error.severity).to.equal(DiagnosticSeverity.Error);
    expect(error.path).to.include('/test');
  });

  it('should pass when a GET operation has no body parameter', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/test': {
          get: {
            parameters: [
              {
                in: 'query',
                name: 'exampleQuery',
                schema: {
                  type: 'string',
                },
              },
            ],
            responses: {
              '200': { description: 'Success' },
            },
          },
        },
      },
    };

    const results = await spectral.run(spec);
    const errors = results.filter((result) => result.code === ruleErrorCode);
    expect(errors.length).to.equal(0);
  });

  it('should pass when a DELETE operation has no body parameter', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/test': {
          delete: {
            parameters: [
              {
                in: 'query',
                name: 'exampleQuery',
                schema: {
                  type: 'string',
                },
              },
            ],
            responses: {
              '204': { description: 'No Content' },
            },
          },
        },
      },
    };

    const results = await spectral.run(spec);
    const errors = results.filter((result) => result.code === ruleErrorCode);
    expect(errors.length).to.equal(0);
  });

  it('should pass when POST operation includes a body parameter', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/test': {
          post: {
            parameters: [
              {
                in: 'body',
                name: 'exampleBody',
                schema: {
                  type: 'object',
                },
              },
            ],
            responses: {
              '201': { description: 'Created' },
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
