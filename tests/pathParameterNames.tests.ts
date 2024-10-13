import assert from 'node:assert';

import type { Spectral } from '@stoplight/spectral-core';
import { DiagnosticSeverity } from '@stoplight/types';
import { expect } from 'chai';

import { loadRuleset, openApiSpec } from './testHelpers.js';

const ruleErrorCode = 'lmn-path-parameter-names';

describe(ruleErrorCode, () => {
  let spectral: Spectral;

  before(async () => {
    spectral = await loadRuleset();
  });

  it('should pass for paths with consistent parameter names', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/users/{user_id}/profile': {
          get: {
            responses: {
              '200': { description: 'Success' },
            },
          },
        },
        '/users/{user_id}/posts': {
          get: {
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

  it('should fail for inconsistent parameter names', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/users/{user_id}/profile': {
          get: {
            responses: {
              '200': { description: 'Success' },
            },
          },
        },
        '/users/{id}/posts': {
          get: {
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
    expect(error.message).to.equal('Inconsistent parameter names "user_id" and "id" for path segment "users".');
    expect(error.severity).to.equal(DiagnosticSeverity.Warning);
    expect(error.path).to.include('/users/{id}/posts');
  });

  it('should pass when there are no path parameters', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/users/profile': {
          get: {
            responses: {
              '200': { description: 'Success' },
            },
          },
        },
        '/users/posts': {
          get: {
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

  it('should pass for paths with consistent parameter names across different segments', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/users/{user_id}/posts/{post_id}': {
          get: {
            responses: {
              '200': { description: 'Success' },
            },
          },
        },
        '/users/{user_id}/comments/{comment_id}': {
          get: {
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

  it('should fail for inconsistent parameter names in the same segment', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/users/{user_id}/profile': {
          get: {
            responses: {
              '200': { description: 'Success' },
            },
          },
        },
        '/users/{user}/settings': {
          get: {
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
    expect(error.message).to.equal('Inconsistent parameter names "user_id" and "user" for path segment "users".');
    expect(error.severity).to.equal(DiagnosticSeverity.Warning);
    expect(error.path).to.include('/users/{user}/settings');
  });

  it('should pass when different path segments have different parameters', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/users/{user_id}/posts': {
          get: {
            responses: {
              '200': { description: 'Success' },
            },
          },
        },
        '/admins/{adminId}/settings': {
          get: {
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
