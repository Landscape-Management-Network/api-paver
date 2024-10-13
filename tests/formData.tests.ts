import assert from 'node:assert';

import type { Spectral } from '@stoplight/spectral-core';
import { DiagnosticSeverity } from '@stoplight/types';
import { expect } from 'chai';

import { loadRuleset, openApiSpec } from './testHelpers.js';

const ruleErrorCode = 'lmn-formdata';

describe(ruleErrorCode, () => {
  let spectral: Spectral;

  before(async () => {
    spectral = await loadRuleset();
  });

  const validParameter = {
    name: 'param',
    in: 'query',
    schema: {
      type: 'string',
    },
  };

  const invalidFormDataParameter = {
    name: 'file',
    in: 'formData',
    schema: {
      type: 'string',
      format: 'binary',
    },
  };

  const testCases = [
    { method: 'post', shouldFail: true },
    { method: 'put', shouldFail: true },
    { method: 'get', shouldFail: true },
    { method: 'delete', shouldFail: true },
    { method: 'post', shouldFail: false, param: validParameter },
    { method: 'put', shouldFail: false, param: validParameter },
  ];

  for (const { method, shouldFail, param = invalidFormDataParameter } of testCases) {
    const spec = {
      ...openApiSpec,
      paths: {
        '/test': {
          [method]: {
            parameters: [param],
          },
        },
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-loop-func
    it(`should ${shouldFail ? 'fail' : 'pass'} when valid parameter is used in ${method.toUpperCase()}`, async () => {
      const results = await spectral.run(spec);
      const errors = results.filter((result) => result.code === ruleErrorCode);

      if (shouldFail) {
        expect(errors.length).to.equal(1);
        const error = errors[0];
        assert(error);
        expect(error.severity).to.equal(DiagnosticSeverity.Information);
        expect(error.path).to.include('parameters');
      } else {
        expect(errors.length).to.equal(0);
      }
    });
  }
});
