import assert from 'node:assert';

import type { Spectral } from '@stoplight/spectral-core';
import { DiagnosticSeverity } from '@stoplight/types';
import { expect } from 'chai';

import { loadRuleset, openApiSpec } from './testHelpers.js';

const ruleErrorCode = 'lmn-path-parameter-schema';

describe(ruleErrorCode, () => {
  let spectral: Spectral;

  before(async () => {
    spectral = await loadRuleset();
  });

  it('should pass when path parameter is type string, has maxLength, and pattern', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/users/{user_id}': {
          put: {
            parameters: [
              {
                name: 'user_id',
                in: 'path',
                required: true,
                schema: {
                  type: 'string',
                  maxLength: 100,
                  pattern: '^[a-zA-Z0-9_-]+$',
                },
              },
            ],
            responses: {
              '201': {
                description: 'Created',
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

  it('should fail when path parameter is not type string', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/users/{user_id}': {
          put: {
            parameters: [
              {
                name: 'user_id',
                in: 'path',
                required: true,
                schema: {
                  type: 'integer',
                  maxLength: 100,
                  pattern: '^[a-zA-Z0-9_-]+$',
                },
              },
            ],
            responses: {
              '201': {
                description: 'Created',
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
    expect(error.message).to.equal('Path parameter should be defined as type: string.');
    expect(error.severity).to.equal(DiagnosticSeverity.Warning);
    expect(error.path).to.include('schema');
  });

  it('should fail when path parameter is missing maxLength and pattern', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/users/{user_id}': {
          put: {
            parameters: [
              {
                name: 'user_id',
                in: 'path',
                required: true,
                schema: {
                  type: 'string',
                },
              },
            ],
            responses: {
              '201': {
                description: 'Created',
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
    expect(error.message).to.equal('Path parameter should specify a maximum length (maxLength) and characters allowed (pattern).');
    expect(error.severity).to.equal(DiagnosticSeverity.Warning);
    expect(error.path).to.include('schema');
  });

  it('should fail when path parameter maxLength exceeds URL_MAX_LENGTH', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/users/{user_id}': {
          put: {
            parameters: [
              {
                name: 'user_id',
                in: 'path',
                required: true,
                schema: {
                  type: 'string',
                  maxLength: 3000,
                  pattern: '^[a-zA-Z0-9_-]+$',
                },
              },
            ],
            responses: {
              '201': {
                description: 'Created',
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
    expect(error.message).to.equal('Path parameter maximum length should be less than 2083');
    expect(error.severity).to.equal(DiagnosticSeverity.Warning);
    expect(error.path).to.include('schema');
  });

  it('should fail when path parameter is missing pattern', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/users/{user_id}': {
          put: {
            parameters: [
              {
                name: 'user_id',
                in: 'path',
                required: true,
                schema: {
                  type: 'string',
                  maxLength: 100,
                },
              },
            ],
            responses: {
              '201': {
                description: 'Created',
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
    expect(error.message).to.equal('Path parameter should specify characters allowed (pattern).');
    expect(error.severity).to.equal(DiagnosticSeverity.Warning);
    expect(error.path).to.include('schema');
  });
});
