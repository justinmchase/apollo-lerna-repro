import { useState, useEffect } from "react"
import { Spinner, useOperationalContext } from "@operational/components"

import { useQuery } from '@apollo/react-hooks'
import { gql } from "apollo-boost"

const HEALTH_QUERY = gql`
  query Site_Health {
    health {
      ok
      version
    }
  }
`

export default function Health() {
  const { pushMessage, setLoading, clearMessages } = useOperationalContext()
  const { loading, error, data = {} as any } = useQuery(HEALTH_QUERY)
  const {
    health: {
      ok = null,
      version = null
    } = {}
  } = data

  useEffect(() => {
    if (error) {
      pushMessage({
        type: "error",
        body: error.message,
      })
    } else {
      clearMessages()
    }
  }, [error])

  useEffect(() => {
    setLoading(loading)
  }, [loading])


  return (
    <p>
      <h4>Health</h4>
      {loading && <Spinner color="#f0f" bounce />}
      {ok != null && <span>ok</span>}
      {version != null && <span> v{version}</span>}
    </p>
  )
}
