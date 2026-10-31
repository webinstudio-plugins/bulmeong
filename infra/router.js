// CloudFront Function (cloudfront-js-2.0, viewer request): /ja/ serves /ja/index.html, /ja gets its trailing slash.
function handler(event) {
  var request = event.request;
  var uri = request.uri;
  if (uri.endsWith('/')) {
    request.uri = uri + 'index.html';
  } else if (/^\/(ko|en|ja|zh|es)$/.test(uri)) {
    return { statusCode: 301, statusDescription: 'Moved Permanently', headers: { location: { value: uri + '/' } } };
  }
  return request;
}
