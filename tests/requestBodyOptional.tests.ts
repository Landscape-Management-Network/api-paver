import assert from 'node:assert';

import type { Spectral } from '@stoplight/spectral-core';
import { DiagnosticSeverity } from '@stoplight/types';
import { expect } from 'chai';

import { loadRuleset, openApiSpec } from './testHelpers.js';

const ruleErrorCode = 'lmn-request-body-optional';

describe(ruleErrorCode, () => {
  let spectral: Spectral;

  before(async () => {
    spectral = await loadRuleset();
  });

  it('should fail when a PUT operation body parameter is not marked as required', async () => {
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
    expect(error.message).to.equal('The body parameter is not marked as required.');
    expect(error.severity).to.equal(DiagnosticSeverity.Information);
    expect(error.path).to.include('/test');
  });

  it('should fail when a POST operation body parameter is not marked as required', async () => {
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
    expect(errors.length).to.equal(1);

    const error = errors[0];
    assert(error);
    expect(error.message).to.equal('The body parameter is not marked as required.');
    expect(error.severity).to.equal(DiagnosticSeverity.Information);
    expect(error.path).to.include('/test');
  });

  it('should fail when a PATCH operation body parameter is not marked as required', async () => {
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
    expect(error.message).to.equal('The body parameter is not marked as required.');
    expect(error.severity).to.equal(DiagnosticSeverity.Information);
    expect(error.path).to.include('/test');
  });

  it('should pass when a PUT operation body parameter is marked as required', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/test': {
          put: {
            parameters: [
              {
                in: 'body',
                name: 'exampleBody',
                required: true,
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
    expect(errors.length).to.equal(0);
  });

  it('should pass when a POST operation body parameter is marked as required', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/test': {
          post: {
            parameters: [
              {
                in: 'body',
                name: 'exampleBody',
                required: true,
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

  it('should pass when a PATCH operation body parameter is marked as required', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/test': {
          patch: {
            parameters: [
              {
                in: 'body',
                name: 'exampleBody',
                required: true,
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
    expect(errors.length).to.equal(0);
  });

  it('should pass when a PUT operation body parameter is explicitly marked as not required', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/test': {
          put: {
            parameters: [
              {
                in: 'body',
                name: 'exampleBody',
                required: false,
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
    expect(errors.length).to.equal(0);
  });
});
