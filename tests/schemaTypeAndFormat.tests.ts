import assert from 'node:assert';

import type { Spectral } from '@stoplight/spectral-core';
import { DiagnosticSeverity } from '@stoplight/types';
import { expect } from 'chai';

import { loadRuleset, openApiSpec } from './testHelpers.js';

const ruleErrorCode = 'lmn-schema-type-and-format';

describe(ruleErrorCode, () => {
  let spectral: Spectral;

  before(async () => {
    spectral = await loadRuleset();
  });

  it('should pass when schema type and format are correct', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/test': {
          post: {
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'number',
                    format: 'double',
                  },
                },
              },
            },
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'string',
                        },
                        count: {
                          type: 'integer',
                          format: 'int32',
                        },
                      },
                    },
                  },
                },
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

  it('should fail when schema type is incorrect - requestBody', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/test': {
          post: {
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'invalidType',
                  },
                },
              },
            },
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: {
                      type: 'number',
                      format: 'double',
                    },
                  },
                },
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
    expect(error.message).to.equal('Schema should use well-defined type and format.');
    expect(error.severity).to.equal(DiagnosticSeverity.Warning);
  });

  it('should fail when schema type is incorrect - response', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/test': {
          post: {
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'number',
                    format: 'double',
                  },
                },
              },
            },
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: {
                      type: 'invalidType',
                    },
                  },
                },
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
    expect(error.message).to.equal('Schema should use well-defined type and format.');
    expect(error.severity).to.equal(DiagnosticSeverity.Warning);
  });

  it('should fail when format is missing for integer type - request', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/test': {
          post: {
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'integer',
                  },
                },
              },
            },
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: {
                      type: 'number',
                      format: 'double',
                    },
                  },
                },
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
    expect(error.message).to.equal('Schema with type: integer should specify format');
    expect(error.severity).to.equal(DiagnosticSeverity.Warning);
  });

  it('should fail when format is missing for integer type - response', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/test': {
          post: {
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'number',
                    format: 'double',
                  },
                },
              },
            },
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: {
                      type: 'integer',
                    },
                  },
                },
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
    expect(error.message).to.equal('Schema with type: integer should specify format');
    expect(error.severity).to.equal(DiagnosticSeverity.Warning);
  });

  it('should ignore string format - request', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/test': {
          post: {
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'string',
                    format: 'invalidFormat',
                  },
                },
              },
            },
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: {
                      type: 'number',
                      format: 'double',
                    },
                  },
                },
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

  it('should ignore string format - response', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/test': {
          post: {
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'number',
                    format: 'double',
                  },
                },
              },
            },
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: {
                      type: 'string',
                      format: 'invalidFormat',
                    },
                  },
                },
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

  it('should fail when array items have incorrect type - request', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/test': {
          post: {
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'invalidType',
                    },
                  },
                },
              },
            },
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: {
                        type: 'number',
                        format: 'double',
                      },
                    },
                  },
                },
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
    expect(error.message).to.equal('Schema should use well-defined type and format.');
    expect(error.severity).to.equal(DiagnosticSeverity.Warning);
  });

  it('should fail when array items have incorrect type - response', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/test': {
          post: {
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'number',
                      format: 'double',
                    },
                  },
                },
              },
            },
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: {
                        type: 'invalidType',
                      },
                    },
                  },
                },
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
    expect(error.message).to.equal('Schema should use well-defined type and format.');
    expect(error.severity).to.equal(DiagnosticSeverity.Warning);
  });

  it('should pass when nested properties have correct type and format', async () => {
    const spec = {
      ...openApiSpec,
      paths: {
        '/test': {
          post: {
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      metadata: {
                        type: 'object',
                        properties: {
                          id: {
                            type: 'integer',
                            format: 'int64',
                          },
                          count: {
                            type: 'integer',
                            format: 'int32',
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        metadata: {
                          type: 'object',
                          properties: {
                            id: {
                              type: 'integer',
                              format: 'int64',
                            },
                            count: {
                              type: 'integer',
                              format: 'int32',
                            },
                          },
                        },
                      },
                    },
                  },
                },
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
