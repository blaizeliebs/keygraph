import Config from './config'
import React from 'react'
import ReactDOM from 'react-dom'
import Auth from './utils/auth'
import ApolloClient, { addTypename } from 'apollo-client'
import createNetworkInterface from './utils/fileupload'
import { ApolloProvider } from 'react-apollo'
import injectTapEventPlugin from 'react-tap-event-plugin'
import App from './app.jsx'

(() => {
  injectTapEventPlugin()
  const networkInterface = createNetworkInterface({ uri: Config.getApi() })

  networkInterface.use([{
    applyMiddleware(req, next) {
      if (!req.options.headers) {
        req.options.headers = {}// Create the header object if needed.
      }
      req.options.headers['authorization'] = `Bearer ${Auth.shared().token}`
      next()
    },
  }])

  const client = new ApolloClient({
    networkInterface: networkInterface,
    queryTransformer: addTypename,
    dataIdFromObject: (result) => {
      if (result.id && result.__typename) {
        let dataId = result.__typename + result.id
        if (result.__typename === 'Image') {
          let matches = result.location.match(/.*?-(\d+|x)-(\d+|x)-(fit|cover|contain)(.jpg|.png|.jpeg)$/)
          if (matches && matches.length > 3) {
            return `${dataId}-${matches[1]}-${matches[2]}-${matches[3]}`
          }
        }
        return dataId
      }
      return null
    },
  })

  Auth.shared(client)

  ReactDOM.render(
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>,
    document.getElementById('react-app')
  )

})()
