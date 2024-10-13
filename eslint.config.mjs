import { config } from 'eslint-config-decent';

export default [
  ...config({
    tsconfigRootDir: import.meta.dirname,
  }),
  {
    files: ['functions/*.js'],
    rules: {
      strict: 'off',
    },
  },
];
