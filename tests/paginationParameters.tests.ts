import assert from 'node:assert';

import type { Spectral } from '@stoplight/spectral-core';
import { DiagnosticSeverity } from '@stoplight/types';
import { expect } from 'chai';

import { loadRuleset, openApiSpec } from './testHelpers.js';

const ruleErrorCode = 'lmn-pagination-parameters';

describe(ruleErrorCode, () => {
  let spectral: Spectral;

  before(async () => {
    spectral = await loadRuleset();
  });

  it('should pass when pagination parameters are correct', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/users': {
          get: {
            parameters: [
              {
                name: 'limit',
                in: 'query',
                schema: {
                  type: 'integer',
                },
                description: 'Specifies the maximum number of items to return in a single response.',
              },
              {
                name: 'offset',
                in: 'query',
                schema: {
                  type: 'integer',
                  default: 0,
                },
                description: 'Specifies the number of items to skip before starting to collect the result set.',
              },
              {
                name: 'sort',
                in: 'query',
                schema: {
                  type: 'string',
                },
                description:
                  "Specifies the order in which results should be returned. Can be a single field or an array of fields, optionally followed by 'asc' or 'desc' to define the sorting direction.",
                example: 'name asc',
              },
            ],
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

  it('should fail when `limit` is not an integer', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/users': {
          get: {
            parameters: [
              {
                name: 'limit',
                in: 'query',
                schema: {
                  type: 'string',
                },
                description: 'Specifies the maximum number of items to return in a single response.',
              },
            ],
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
    expect(error.message).to.equal('limit parameter must be of type integer');
  });

  it('should fail when `offset` has an incorrect default value', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/users': {
          get: {
            parameters: [
              {
                name: 'offset',
                in: 'query',
                schema: {
                  type: 'integer',
                  default: 10,
                },
                description: 'Specifies the number of items to skip before starting to collect the result set.',
              },
            ],
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
    expect(error.message).to.equal('offset parameter must have a default value of 0');
  });

  it('should pass when `sort` does not include asc/desc, and asc is assumed', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/users': {
          get: {
            parameters: [
              {
                name: 'sort',
                in: 'query',
                schema: {
                  type: 'string',
                },
                description:
                  "Specifies the order in which results should be returned. Can be a single field or an array of fields, optionally followed by 'asc' or 'desc' to define the sorting direction.",
                example: 'name',
              },
            ],
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

  it('should fail when `fields` is not an array of strings', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/users': {
          get: {
            parameters: [
              {
                name: 'fields',
                in: 'query',
                schema: {
                  type: 'integer',
                },
                description: 'Specifies which fields to include in the response. Can be a string or an array of strings.',
              },
            ],
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
    expect(error.message).to.equal('fields parameter must be of type string or array');
  });

  it('should fail when no pagination parameters are present', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/users': {
          get: {
            parameters: [],
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
    expect(error.message).to.equal('Pagination parameters (limit, offset, sort, or fields) are missing.');
  });
});
