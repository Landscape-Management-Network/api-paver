import assert from 'node:assert';

import type { Spectral } from '@stoplight/spectral-core';
import { DiagnosticSeverity } from '@stoplight/types';
import { expect } from 'chai';

import { loadRuleset, openApiSpec } from './testHelpers.js';

const ruleErrorCode = 'lmn-parameter-names-convention';

describe(ruleErrorCode, () => {
  let spectral: Spectral;

  before(async () => {
    spectral = await loadRuleset();
  });

  it('should pass for valid snake_case parameter names', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/test': {
          get: {
            parameters: [
              {
                name: 'valid_param_name',
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

  it('should pass for valid single word parameter names', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/test': {
          get: {
            parameters: [
              {
                name: 'foo',
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

  it('should fail for invalid camelCase parameter names', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/test': {
          get: {
            parameters: [
              {
                name: 'camelCaseParamName',
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
    expect(error.severity).to.equal(DiagnosticSeverity.Warning);
    expect(error.path).to.include('parameters');
  });

  it('should fail for invalid PascalCase parameter names', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/test': {
          get: {
            parameters: [
              {
                name: 'PascalCaseParamName',
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
    expect(error.severity).to.equal(DiagnosticSeverity.Warning);
    expect(error.path).to.include('parameters');
  });

  it('should fail for invalid capitalized single word parameter names', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/test': {
          get: {
            parameters: [
              {
                name: 'Foo',
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
    expect(error.severity).to.equal(DiagnosticSeverity.Warning);
    expect(error.path).to.include('parameters');
  });

  it('should fail for invalid UPPER parameter names', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/test': {
          get: {
            parameters: [
              {
                name: 'FOO',
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
    expect(error.severity).to.equal(DiagnosticSeverity.Warning);
    expect(error.path).to.include('parameters');
  });
});
