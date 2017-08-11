import React, { Component } from 'react'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import PropTypes from 'prop-types'

class App extends Component {

  static propTypes = {
    data: PropTypes.object,
  }

  render() {
    let message = `Loading`
    if (this.props.data.data) {
      message = this.props.data.data.hello
    }
    return (
      <h1>{message}</h1>
    )
  }

}

const AppQuery = gql`
  query AppQuery($name:String) {
    data {
      hello(name: $name)
    }
  }
`

let GraphApp = graphql(AppQuery, {
  options: (props) => ({
    variables: {
      name: props.name || 'World',
    },
  }),
})(App)

export default GraphApp
