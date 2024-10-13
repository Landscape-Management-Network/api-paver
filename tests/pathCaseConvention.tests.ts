import assert from 'node:assert';

import type { Spectral } from '@stoplight/spectral-core';
import { DiagnosticSeverity } from '@stoplight/types';
import { expect } from 'chai';

import { loadRuleset, openApiSpec } from './testHelpers.js';

const ruleErrorCode = 'lmn-path-case-convention';

describe(ruleErrorCode, () => {
  let spectral: Spectral;

  before(async () => {
    spectral = await loadRuleset();
  });

  it('should pass for correct kebab-case path segments', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/users': {
          get: {
            responses: {
              '200': { description: 'Success' },
            },
          },
        },
        '/user-profile': {
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

  it('should fail for camelCase static path segment', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/userProfile': {
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
    expect(error.message).to.equal('Static path segments should be kebab-case.');
    expect(error.severity).to.equal(DiagnosticSeverity.Error);
    expect(error.path).to.include('/userProfile');
  });

  it('should fail for PascalCase static path segment', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/UserProfile': {
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
    expect(error.message).to.equal('Static path segments should be kebab-case.');
    expect(error.severity).to.equal(DiagnosticSeverity.Error);
    expect(error.path).to.include('/UserProfile');
  });

  it('should fail for upper-case letters in static path segment', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/USER-PROFILE': {
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
    expect(error.message).to.equal('Static path segments should be kebab-case.');
    expect(error.severity).to.equal(DiagnosticSeverity.Error);
    expect(error.path).to.include('/USER-PROFILE');
  });

  it('should pass for paths with dynamic parameters', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/users/{user_id}': {
          get: {
            responses: {
              '200': { description: 'Success' },
            },
          },
        },
        '/user-profile/{profile_id}': {
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

  it('should fail for mixed case static path segment with dynamic parameters', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/userProfile/{user_id}': {
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
    expect(error.message).to.equal('Static path segments should be kebab-case.');
    expect(error.severity).to.equal(DiagnosticSeverity.Error);
    expect(error.path).to.include('/userProfile/{user_id}');
  });

  it('should pass for paths with trailing variable parts like ":id"', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/user-profile:123': {
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
