# API Paver

This repository contains a Style Guide for OpenAPI definitions of LMN services. The style guide is a companion
to the OpenAPI 3.1 specification.

This repository also contains a [Spectral](https://github.com/stoplightio/spectral) ruleset to check an API definition
for conformance to the LMN API Guidelines and this Style Guide.

## How to use the Spectral Ruleset

### Dependencies

The Spectral Ruleset requires Node version 22 or later.

### Install Spectral

`npm i @stoplight/spectral-cli`

### Usage

You can specify the ruleset directly on the command line:

`spectral lint -r https://raw.githubusercontent.com/Landscape-Management-Network/api-style-guide/main/spectral.yaml <api definition file>`

Or you can create a Spectral configuration file (`.spectral.yaml`) that references the ruleset:

```yaml
extends:
  - https://raw.githubusercontent.com/Landscape-Management-Network/api-style-guide/main/spectral.yaml
```

### Using the Spectral Visual Studio Code extension

There is a [Spectral Visual Studio Code extension](https://marketplace.visualstudio.com/items?itemName=stoplight.spectral) that will
run the Spectral linter on an open API definition file and show errors right within Visual Studio Code. You can use this ruleset with the Spectral Visual Studio Code extension.

1. Install the Spectral Visual Studio Code extension from the extensions tab in Visual Studio Code.
2. Create a Spectral configuration file (`.spectral.yaml`) in the root directory of your project
   as shown above.
3. Set `spectral.rulesetFile` to the name of this configuration file in your Visual Studio Code settings.

Now when you open an API definition in this project, it should highlight lines with errors.
You can also get a full list of problems in the file by opening the "Problems panel" with "View / Problems".
In the Problems panel you can filter to show or hide errors, warnings, or infos.

## Contributing

- Ensure you are using **Node.js 22** or later. You can check your Node.js version by running:

  ```sh
  node -v
  ```

- Install dependencies

  ```sh
  npm install
  ```

### Create or Update Rules

- Spectral rules are defined in the `spectral.yaml` file and in custom functions
- If you’re adding a new rule, ensure that it follows the overall style and consistency of the existing rules.
- Custom rule functions should be placed in the `functions/` directory and must be exported using **ESM** syntax.
