// Serves the production build, minified and compressed as a real server would, for the Lighthouse
// audits; the API calls go to the back-end, like with ng serve
export default {
  build: { outDir: 'dist/mdd-front/browser' },
  preview: {
    port: 4300,
    strictPort: true,
    proxy: { '/api': 'http://localhost:8080' },
  },
};
