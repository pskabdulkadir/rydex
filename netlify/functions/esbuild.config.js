import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  plugins: [
    {
      name: 'alias-plugin',
      setup(build) {
        // @shared/* -> ../shared/*
        build.onResolve({ filter: /^@shared\// }, (args) => {
          const newPath = path.join(__dirname, '..', args.path.replace('@shared/', 'shared/'));
          return { path: newPath };
        });
      },
    },
  ],
};
