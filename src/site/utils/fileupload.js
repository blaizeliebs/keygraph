import { printAST } from 'apollo-client'
import { HTTPFetchNetworkInterface, printRequest } from 'apollo-client/transport/networkInterface'

export default function createNetworkInterface(opts) {
  const { uri } = opts
  return new UploadNetworkInterface(uri, opts)
}

export class UploadNetworkInterface extends HTTPFetchNetworkInterface {

  fetchFromRemoteEndpoint(req) {
    const options = this.isUpload(req)
      ? this.getUploadOptions(req)
      : this.getJSONOptions(req)
    return fetch(this._uri, options)
  }

  isUpload({ request }) {
    if (request.variables) {
      if (request.variables.input) {
        for (let key in request.variables.input) {
          if (request.variables.input[key] instanceof File) {
            return true
          }
        }
      }
    }
    return false
  }

  getJSONOptions({ request, options }) {
    return Object.assign({}, this._opts, {
      body: JSON.stringify(printRequest(request)),
      method: 'POST',
    }, options, {
      headers: Object.assign({}, {
        Accept: '*/*',
        'Content-Type': 'application/json',
      }, options.headers),
    })
  }

  getUploadOptions({ request, options }) {
    const body = new FormData()

    for (let key in request.variables.input) {
      let v = request.variables.input[key]
      if (v instanceof File) {
        body.append(key, v)
        delete request.variables.input[key]
      }
    }

    body.append('operationName', request.operationName)
    body.append('query', printAST(request.query))
    body.append('variables', JSON.stringify(request.variables))

    return Object.assign({}, this._opts, {
      body,
      method: 'POST',
    }, options, {
      headers: Object.assign({}, {
        Accept: '*/*',
      }, options.headers),
    })
  }

}
