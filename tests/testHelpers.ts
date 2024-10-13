import * as fs from 'node:fs';
import path from 'node:path';

import spectralCore from '@stoplight/spectral-core';
// @ts-expect-error: Import from ESM
import { bundleAndLoadRuleset } from '@stoplight/spectral-ruleset-bundler/with-loader';
import spectralRuntime from '@stoplight/spectral-runtime';
import type { OpenAPIV3 } from 'openapi-types';

const { Spectral } = spectralCore;
const { fetch } = spectralRuntime;

export async function loadRuleset(): Promise<spectralCore.Spectral> {
  const rulesetPath = path.resolve(import.meta.dirname, '../spectral.yaml');
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
  const ruleset = await bundleAndLoadRuleset(rulesetPath, {
    fetch,
    fs,
  });
  const spectral = new Spectral();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  spectral.setRuleset(ruleset);
  return spectral;
}

export const openApiSpec: OpenAPIV3.Document = {
  openapi: '3.0.0',
  info: {
    title: 'Test API',
    version: '1.0.0',
  },
  paths: {},
};
