import { OperationalUI, Page, } from "@operational/components"
import { ApolloProvider } from '@apollo/react-hooks'
import { client } from '../services/apollo'
import Health from "./health"

export default function App({ page }) {
  return (
    <ApolloProvider client={client}>
      <OperationalUI>
        <Page title={`Hello ${page}`}>
          <Health />
        </Page>
      </OperationalUI>
    </ApolloProvider>
  )
}
