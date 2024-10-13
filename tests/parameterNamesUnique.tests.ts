import assert from 'node:assert';

import type { Spectral } from '@stoplight/spectral-core';
import { DiagnosticSeverity } from '@stoplight/types';
import { expect } from 'chai';

import { loadRuleset, openApiSpec } from './testHelpers.js';

const ruleErrorCode = 'lmn-parameter-names-unique';

describe(ruleErrorCode, () => {
  let spectral: Spectral;

  before(async () => {
    spectral = await loadRuleset();
  });

  it('should pass when all parameter names are unique', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/users': {
          get: {
            parameters: [
              { name: 'user_id', in: 'query', schema: { type: 'string' } },
              { name: 'limit', in: 'query', schema: { type: 'integer' } },
            ],
          },
        },
      },
    };

    const results = await spectral.run(spec);
    const errors = results.filter((result) => result.code === ruleErrorCode);
    expect(errors.length).to.equal(0);
  });

  it('should fail when parameter names are duplicated in the same operation (case-insensitive)', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/users': {
          get: {
            parameters: [
              { name: 'user_id', in: 'query', schema: { type: 'string' } },
              { name: 'User_id', in: 'query', schema: { type: 'string' } },
            ],
          },
        },
      },
    };

    const results = await spectral.run(spec);
    const errors = results.filter((result) => result.code === ruleErrorCode);
    expect(errors.length).to.equal(1);
    const error = errors[0];
    assert(error);
    expect(error.message).to.equal('Duplicate parameter name (ignoring case) with get.parameters.0.');
    expect(error.severity).to.equal(DiagnosticSeverity.Warning);
    expect(error.path).to.include('parameters');
  });

  it('should fail when parameter names are duplicated between path and operation (case-insensitive)', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/users': {
          parameters: [{ name: 'user_id', in: 'path', schema: { type: 'string' } }],
          get: {
            parameters: [{ name: 'USER_ID', in: 'query', schema: { type: 'string' } }],
          },
        },
      },
    };

    const results = await spectral.run(spec);
    const errors = results.filter((result) => result.code === ruleErrorCode);
    expect(errors.length).to.equal(1);
    const error = errors[0];
    assert(error);
    expect(error.message).to.equal('Duplicate parameter name (ignoring case) with parameters.0.');
    expect(error.severity).to.equal(DiagnosticSeverity.Warning);
    expect(error.path).to.include('parameters');
  });

  it('should pass when parameter names are unique between different methods', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/users': {
          get: {
            parameters: [{ name: 'user_id', in: 'query', schema: { type: 'string' } }],
          },
          post: {
            parameters: [
              { name: 'User_id', in: 'query', schema: { type: 'string' } }, // Same name but different method, should pass
            ],
          },
        },
      },
    };

    const results = await spectral.run(spec);
    const errors = results.filter((result) => result.code === ruleErrorCode);
    expect(errors.length).to.equal(0);
  });

  it('should not fail with duplicate parameter names exist across different methods (case-insensitive)', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/users': {
          get: {
            parameters: [{ name: 'user_id', in: 'query', schema: { type: 'string' } }],
          },
          put: {
            parameters: [
              { name: 'USER_ID', in: 'query', schema: { type: 'string' } }, // Duplicate (case-insensitive)
            ],
          },
        },
      },
    };

    const results = await spectral.run(spec);
    const errors = results.filter((result) => result.code === ruleErrorCode);
    expect(errors.length).to.equal(0);
  });
});
