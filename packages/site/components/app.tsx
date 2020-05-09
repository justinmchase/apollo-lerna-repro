import { useState } from "react"
import { Button, OperationalUI, Page, Spinner, useOperationalContext } from "@operational/components"
import UPort from "./uport"

import { ApolloProvider, useQuery } from '@apollo/react-hooks'
import { client } from '../services/apollo'
import { gql } from "apollo-boost"
import Health from "./health"

const HEALTH_QUERY = gql`
  query Site_Health {
    health {
      ok
      version
    }
  }
`

// Always wrap your interface in the `OperationalUI` wrapper,
// which does important setup work, and takes a single child element.
// See https://www.npmjs.com/package/%40operational%2Fcomponents
export default function App({ page }) {
  const [showLogin, setShowLogin] = useState(false)

  return (
    <ApolloProvider client={client}>
      <OperationalUI>
        <Page title={`Hello ${page}`}>
          <Health />
          {showLogin && (
            <UPort onComplete={() => console.log('Complete!')} onCancel={() => setShowLogin(false)} />
          )}
          <Button onClick={() => setShowLogin(true)}>Login</Button>

        </Page>
      </OperationalUI>
    </ApolloProvider>
  )
}
