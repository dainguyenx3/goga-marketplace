import { createProxyMiddleware } from 'http-proxy-middleware';

module.exports = function(app: any) {
  app.use(
    '/rest',
    createProxyMiddleware({
      target: `${process.env.REACT_APP_URL_API}/rest`,
      changeOrigin: true,
    })
  );
};