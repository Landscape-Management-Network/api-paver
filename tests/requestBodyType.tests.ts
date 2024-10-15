import assert from 'node:assert';

import type { Spectral } from '@stoplight/spectral-core';
import { DiagnosticSeverity } from '@stoplight/types';
import { expect } from 'chai';

import { loadRuleset, openApiSpec } from './testHelpers.js';

const ruleErrorCode = 'lmn-request-body-type';

describe(ruleErrorCode, () => {
  let spectral: Spectral;

  before(async () => {
    spectral = await loadRuleset();
  });

  it('should fail when the request body schema is a bare array for a PUT operation', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/test': {
          put: {
            parameters: [
              {
                in: 'body',
                name: 'exampleBody',
                schema: {
                  type: 'array',
                  items: { type: 'string' },
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
    expect(error.message).to.match(/must not be a bare array/i);
    expect(error.severity).to.equal(DiagnosticSeverity.Warning);
    expect(error.path).to.include('/test');
  });

  it('should fail when the request body schema is a bare array for a POST operation', async () => {
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
                  type: 'array',
                  items: { type: 'string' },
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
    expect(errors.length).to.equal(1);

    const error = errors[0];
    assert(error);
    expect(error.message).to.match(/must not be a bare array/i);
    expect(error.severity).to.equal(DiagnosticSeverity.Warning);
    expect(error.path).to.include('/test');
  });

  it('should fail when the request body schema is a bare array for a PATCH operation', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/test': {
          patch: {
            parameters: [
              {
                in: 'body',
                name: 'exampleBody',
                schema: {
                  type: 'array',
                  items: { type: 'string' },
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
    expect(error.message).to.match(/must not be a bare array/i);
    expect(error.severity).to.equal(DiagnosticSeverity.Warning);
    expect(error.path).to.include('/test');
  });

  it('should pass when the request body schema is an object for a PUT operation', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/test': {
          put: {
            parameters: [
              {
                in: 'body',
                name: 'exampleBody',
                schema: {
                  type: 'object',
                  properties: {
                    foo: { type: 'string' },
                  },
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

  it('should pass when the request body schema is an object for a POST operation', async () => {
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
                  properties: {
                    foo: { type: 'string' },
                  },
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

  it('should pass when the request body schema is an object for a PATCH operation', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/test': {
          patch: {
            parameters: [
              {
                in: 'body',
                name: 'exampleBody',
                schema: {
                  type: 'object',
                  properties: {
                    foo: { type: 'string' },
                  },
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
});
