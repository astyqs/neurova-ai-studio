import requestHandler from '../server/index.js'

export default function neurovaApi(request, response) {
  const incoming = new URL(request.url, `https://${request.headers.host || 'neurova.local'}`)
  const apiPath = incoming.searchParams.get('__path')

  if (apiPath !== null) {
    incoming.searchParams.delete('__path')
    request.url = `/api/${apiPath.replace(/^\/+/, '')}${incoming.search}`
  }

  return requestHandler(request, response)
}
