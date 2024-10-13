import assert from 'node:assert';

import type { Spectral } from '@stoplight/spectral-core';
import { DiagnosticSeverity } from '@stoplight/types';
import { expect } from 'chai';

import { loadRuleset, openApiSpec } from './testHelpers.js';

const ruleErrorCode = 'lmn-default-response';

describe(ruleErrorCode, () => {
  let spectral: Spectral;

  before(async () => {
    spectral = await loadRuleset();
  });

  it('should pass when an operation has a default response', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/test': {
          get: {
            responses: {
              '200': {
                description: 'Success response',
              },
              default: {
                code: 'foo',
                message: 'Error response',
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

  it('should fail when an operation is missing a default response', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/test': {
          get: {
            responses: {
              '200': {
                description: 'Success response',
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
    expect(error.message).to.equal('Operation is missing a default response.');
    expect(error.path).to.contain('/test');
  });

  it('should fail for multiple operations missing default response', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/test': {
          get: {
            responses: {
              '200': {
                description: 'Success response',
              },
            },
          },
          post: {
            responses: {
              '201': {
                description: 'Created response',
              },
            },
          },
        },
      },
    };

    const results = await spectral.run(spec);
    const errors = results.filter((result) => result.code === ruleErrorCode);

    expect(errors.length).to.equal(2);
    const error1 = errors[0];
    const error2 = errors[1];

    assert(error1 && error2);
    expect(error1.severity).to.equal(DiagnosticSeverity.Warning);
    expect(error2.severity).to.equal(DiagnosticSeverity.Warning);

    expect(error1.message).to.equal('Operation is missing a default response.');
    expect(error2.message).to.equal('Operation is missing a default response.');

    expect(error1.path).to.contain('/test');
    expect(error1.path).to.contain('get');
    expect(error2.path).to.contain('/test');
    expect(error2.path).to.contain('post');
  });

  it('should pass when all operations have a default response', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/test': {
          get: {
            responses: {
              '200': {
                description: 'Success response',
              },
              default: {
                code: 'foo',
                message: 'Error response',
              },
            },
          },
          post: {
            responses: {
              '201': {
                description: 'Created response',
              },
              default: {
                code: 'foo',
                message: 'Error response',
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
