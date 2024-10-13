import assert from 'node:assert';

import type { Spectral } from '@stoplight/spectral-core';
import { DiagnosticSeverity } from '@stoplight/types';
import { expect } from 'chai';

import { loadRuleset, openApiSpec } from './testHelpers.js';

const ruleErrorCode = 'lmn-path-characters';

describe(ruleErrorCode, () => {
  let spectral: Spectral;

  before(async () => {
    spectral = await loadRuleset();
  });

  it('should pass for paths with recommended characters', async () => {
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
        '/users/{user_id}': {
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

  it('should fail for path with spaces', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/users /profile': {
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
    expect(error.message).to.equal('Path contains non-recommended characters.');
    expect(error.severity).to.equal(DiagnosticSeverity.Error);
    expect(error.path).to.include('/users /profile');
  });

  it('should fail for path with special characters like @, #, &', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/users@profile': {
          get: {
            responses: {
              '200': { description: 'Success' },
            },
          },
        },
        '/users&profile': {
          get: {
            responses: {
              '200': { description: 'Success' },
            },
          },
        },
        '/users#profile': {
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
    expect(errors.length).to.equal(3);

    const error = errors[0];
    assert(error);
    expect(error.message).to.equal('Path contains non-recommended characters.');
    expect(error.severity).to.equal(DiagnosticSeverity.Error);
    expect(error.path).to.include('/users@profile');
  });

  it('should fail for path with invalid characters like asterisk (*)', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/users*profile': {
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
    expect(error.message).to.equal('Path contains non-recommended characters.');
    expect(error.severity).to.equal(DiagnosticSeverity.Error);
    expect(error.path).to.include('/users*profile');
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
        '/users/{user_id}/profile': {
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

  it('should fail for invalid characters after path parameters', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/users/{user_id}@profile': {
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
    expect(error.message).to.equal('Path contains non-recommended characters.');
    expect(error.severity).to.equal(DiagnosticSeverity.Error);
    expect(error.path).to.include('/users/{user_id}@profile');
  });

  it('should pass for paths with trailing parts like ":id"', async () => {
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
