import assert from 'node:assert';

import type { Spectral } from '@stoplight/spectral-core';
import { DiagnosticSeverity } from '@stoplight/types';
import { expect } from 'chai';

import { loadRuleset, openApiSpec } from './testHelpers.js';

const ruleErrorCode = 'lmn-version-policy';

describe(ruleErrorCode, () => {
  let spectral: Spectral;

  before(async () => {
    spectral = await loadRuleset();
  });

  it('should pass for version identifier in the path', async () => {
    const apiPath = '/v1/test';
    const spec = {
      ...openApiSpec,
      paths: {
        [apiPath]: {
          get: {
            parameters: [
              {
                name: 'param_foo',
                in: 'query',
                schema: {
                  type: 'string',
                },
              },
            ],
          },
        },
      },
    };

    const results = await spectral.run(spec);
    const errors = results.filter((result) => result.code === ruleErrorCode);
    expect(errors.length).to.equal(0);
  });

  it('should fail for capitalized v', async () => {
    const apiPath = '/V1/test';
    const spec = {
      ...openApiSpec,
      paths: {
        [apiPath]: {
          get: {
            parameters: [
              {
                name: 'param_foo',
                in: 'query',
                schema: {
                  type: 'string',
                },
              },
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
    expect(error.severity).to.equal(DiagnosticSeverity.Error);
    expect(error.path).to.include(apiPath);
  });

  it('should fail for version with point release', async () => {
    const apiPath = '/v1.1/test';
    const spec = {
      ...openApiSpec,
      paths: {
        [apiPath]: {
          get: {
            parameters: [
              {
                name: 'param_foo',
                in: 'query',
                schema: {
                  type: 'string',
                },
              },
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
    expect(error.severity).to.equal(DiagnosticSeverity.Error);
    expect(error.path).to.include(apiPath);
  });

  it('should fail for no version', async () => {
    const apiPath = '/test';
    const spec = {
      ...openApiSpec,
      paths: {
        [apiPath]: {
          get: {
            parameters: [
              {
                name: 'param_foo',
                in: 'query',
                schema: {
                  type: 'string',
                },
              },
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
    expect(error.severity).to.equal(DiagnosticSeverity.Error);
    expect(error.path).to.include(apiPath);
  });

  it('should fail for version without a number', async () => {
    const apiPath = '/va/test';
    const spec = {
      ...openApiSpec,
      paths: {
        [apiPath]: {
          get: {
            parameters: [
              {
                name: 'param_foo',
                in: 'query',
                schema: {
                  type: 'string',
                },
              },
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
    expect(error.severity).to.equal(DiagnosticSeverity.Error);
    expect(error.path).to.include(apiPath);
  });

  it('should fail for version without a v prefix', async () => {
    const apiPath = '/42/test';
    const spec = {
      ...openApiSpec,
      paths: {
        [apiPath]: {
          get: {
            parameters: [
              {
                name: 'param_foo',
                in: 'query',
                schema: {
                  type: 'string',
                },
              },
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
    expect(error.severity).to.equal(DiagnosticSeverity.Error);
    expect(error.path).to.include(apiPath);
  });
});
