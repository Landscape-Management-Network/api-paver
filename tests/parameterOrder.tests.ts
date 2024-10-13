import assert from 'node:assert';

import type { Spectral } from '@stoplight/spectral-core';
import { DiagnosticSeverity } from '@stoplight/types';
import { expect } from 'chai';

import { loadRuleset, openApiSpec } from './testHelpers.js';

const ruleErrorCode = 'lmn-parameter-order';

describe(ruleErrorCode, () => {
  let spectral: Spectral;

  before(async () => {
    spectral = await loadRuleset();
  });

  it('should pass when path parameters are in correct order', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/users/{user_id}/posts/{post_id}': {
          get: {
            parameters: [
              { name: 'user_id', in: 'path', required: true, schema: { type: 'string' } },
              { name: 'post_id', in: 'path', required: true, schema: { type: 'string' } },
            ],
          },
        },
      },
    };

    const results = await spectral.run(spec);
    const errors = results.filter((result) => result.code === ruleErrorCode);
    expect(errors.length).to.equal(0);
  });

  it('should fail when path parameters are out of order in the path-level parameters', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/users/{user_id}/posts/{post_id}': {
          parameters: [
            { name: 'post_id', in: 'path', required: true, schema: { type: 'string' } },
            { name: 'user_id', in: 'path', required: true, schema: { type: 'string' } }, // Out of order
          ],
        },
      },
    };

    const results = await spectral.run(spec);
    const errors = results.filter((result) => result.code === ruleErrorCode);
    expect(errors.length).to.equal(1);
    const error = errors[0];
    assert(error);
    expect(error.message).to.equal('Path parameter "user_id" should appear before "post_id".');
    expect(error.severity).to.equal(DiagnosticSeverity.Warning);
    expect(error.path).to.include('parameters');
  });

  it('should fail when path parameters are out of order in the operation-level parameters', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/users/{user_id}/posts/{post_id}': {
          get: {
            parameters: [
              { name: 'post_id', in: 'path', required: true, schema: { type: 'string' } }, // Out of order
              { name: 'user_id', in: 'path', required: true, schema: { type: 'string' } },
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
    expect(error.message).to.equal('Path parameter "user_id" should appear before "post_id".');
    expect(error.severity).to.equal(DiagnosticSeverity.Warning);
    expect(error.path).to.include('parameters');
  });

  it('should pass when parameters are in correct order across methods', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/users/{user_id}/posts/{post_id}': {
          parameters: [{ name: 'user_id', in: 'path', required: true, schema: { type: 'string' } }],
          get: {
            parameters: [{ name: 'post_id', in: 'path', required: true, schema: { type: 'string' } }],
          },
        },
      },
    };

    const results = await spectral.run(spec);
    const errors = results.filter((result) => result.code === ruleErrorCode);
    expect(errors.length).to.equal(0);
  });

  it('should fail when parameters are out of order across methods', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/users/{user_id}/posts/{post_id}': {
          parameters: [
            { name: 'post_id', in: 'path', required: true, schema: { type: 'string' } }, // Out of order
          ],
          get: {
            parameters: [{ name: 'user_id', in: 'path', required: true, schema: { type: 'string' } }],
          },
        },
      },
    };

    const results = await spectral.run(spec);
    const errors = results.filter((result) => result.code === ruleErrorCode);
    expect(errors.length).to.equal(1);
    const error = errors[0];
    assert(error);
    expect(error.message).to.equal('Path parameter "user_id" should appear before "post_id".');
    expect(error.severity).to.equal(DiagnosticSeverity.Warning);
    expect(error.path).to.include('parameters');
  });

  it('should pass for paths with no path parameters', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/users': {
          get: {
            parameters: [{ name: 'limit', in: 'query', required: false, schema: { type: 'integer' } }],
          },
        },
      },
    };

    const results = await spectral.run(spec);
    const errors = results.filter((result) => result.code === ruleErrorCode);
    expect(errors.length).to.equal(0);
  });
});
