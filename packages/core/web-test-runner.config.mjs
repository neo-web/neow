import { chromeLauncher} from '@web/test-runner';
console.log(process.env.CHROME_BIN);
export default {
  files: 'test/**/*.test.js',
  nodeResolve: true,
  mimeTypes: {
    '.ts': 'text/x.typescript'
  },
  browsers: [
    chromeLauncher({
      launchOptions: {
        args: [
          '--disable-gpu',
          '--no-service-autorun',
          '--no-experiments',
          '--no-default-browser-check',
          '--disable-dev-shm-usage',
          '--disable-setuid-sandbox',
          '--no-first-run',
          '--no-sandbox',
          '--no-zygote',
          '--single-process',
          '--headless',
          '--allow-insecure-localhost',
          '--disable-extensions',
          '--bwsi'
        ]
      }
    })
  ]
};