import assert from 'node:assert';

import type { Spectral } from '@stoplight/spectral-core';
import { DiagnosticSeverity } from '@stoplight/types';
import { expect } from 'chai';

import { loadRuleset, openApiSpec } from './testHelpers.js';

const ruleErrorCode = 'lmn-operation-summary-or-description';

describe(ruleErrorCode, () => {
  let spectral: Spectral;

  before(async () => {
    spectral = await loadRuleset();
  });

  it('should pass when a summary is present', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/test': {
          get: {
            summary: 'Retrieve data',
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

  it('should pass when a description is present', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/test': {
          get: {
            description: 'Retrieve data from the service',
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

  it('should fail when neither summary nor description is present', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/test': {
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
    expect(error.severity).to.equal(DiagnosticSeverity.Warning);
    expect(error.message).to.equal('Operation should have a summary or description.');
  });

  it('should fail for multiple operations without summary or description', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/test': {
          get: {
            responses: {
              '200': { description: 'Success' },
            },
          },
          post: {
            responses: {
              '201': { description: 'Created' },
            },
          },
        },
      },
    };

    const results = await spectral.run(spec);
    const errors = results.filter((result) => result.code === ruleErrorCode);

    expect(errors.length).to.equal(2);
    const errorGet = errors[0];
    const errorPost = errors[1];

    assert(errorGet);
    expect(errorGet.severity).to.equal(DiagnosticSeverity.Warning);
    expect(errorGet.message).to.equal('Operation should have a summary or description.');

    assert(errorPost);
    expect(errorPost.severity).to.equal(DiagnosticSeverity.Warning);
    expect(errorPost.message).to.equal('Operation should have a summary or description.');
  });

  it('should pass for operations with either summary or description', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/test': {
          get: {
            summary: 'Get test data',
            responses: {
              '200': { description: 'Success' },
            },
          },
          post: {
            description: 'Create a new resource',
            responses: {
              '201': { description: 'Created' },
            },
          },
        },
      },
    };

    const results = await spectral.run(spec);
    const errors = results.filter((result) => result.code === ruleErrorCode);
    expect(errors.length).to.equal(0); // No errors, as both GET and POST have summary or description
  });
});
