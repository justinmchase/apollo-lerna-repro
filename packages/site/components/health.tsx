import { useEffect, useState } from "react"
import { Spinner, useOperationalContext, useInterval } from "@operational/components"

import { useQuery } from '@apollo/react-hooks'
import { gql } from "apollo-boost"

const HEALTH_QUERY = gql`
  query Site_Health($count:Int!) {
    health(count:$count) {
      ok
      instanceId
      version
    }
  }
`

export default function Health() {
  const [count, setCount] = useState(0)
  const [countDown, setCountDown] = useState(5)
  const { pushMessage, setLoading, clearMessages } = useOperationalContext()
  const { refetch, loading, error, data = {} as any } = useQuery(HEALTH_QUERY, {
    variables: {
      count
    }
  })

  const {
    health: {
      ok = null,
      instanceId = null,
      version = null
    } = {}
  } = data

  useInterval(() => {
    const c = count + 1
    setCount(c)
    setCountDown(5)
    refetch({ count: c })
  }, 5000)

  useInterval(() => {
    setCountDown(countDown - 1)
  }, 1000)

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
    <>
      <h4>Health</h4>
      <p>{(loading || error) && <Spinner color="#f0f" bounce />}</p>
      <p>next in {countDown}s...</p>
      <p>count: {count}</p>
      <p>ok: {Boolean(ok).toString()}</p>
      <p>instanceId: {instanceId}</p>
      {version != null && <p> v{version}</p>}
    </>
  )
}
