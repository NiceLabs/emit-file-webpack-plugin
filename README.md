# @nice-labs/emit-file-webpack-plugin

Emit a file to output directory

## Installation

```bash
npm install --save-dev @nice-labs/emit-file-webpack-plugin
```

## Usage

```typescript
import { Configuration } from 'webpack'
import { emitFile } from '@nice-labs/emit-file-webpack-plugin'

const configuration: Configuration = {
  // ...
  plugins: [
    // ...
    emitFile({
      disabled: false, // disable the plugin
      name: '...', // output file name
      content: '...', // output file content
    }),
    // ...
  ],
  // ...
}

export default configuration
```

## LICENSE

[MIT](LICENSE)
