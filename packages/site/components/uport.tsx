import { gql } from 'apollo-boost'
import { Modal, Button } from '@operational/components'
import { useMutation } from '@apollo/react-hooks'
import { useEffect } from 'react'

const CONNECT_MUTATION = gql`
  mutation Site_Connect {
    connect {
      _id
      state
      token
      qr
    }
  }
`

export default function UPort({ onComplete, onCancel }) {
  const [connect, { called, loading, error, data = {} as any }] = useMutation(CONNECT_MUTATION)
  async function start() {
    const result = await connect({
      fetchPolicy: "no-cache",
      variables: {
      }
    })
  }

  const {
    connect: {
      _id = null,
      state = null,
      token = null,
      qr = null
    } = {}
  } = data

  console.log(data)
  if (!called) {
    start().catch(err => console.log(err, JSON.stringify(err, null, 2)))
  }

  return (
    <Modal
      isOpen={true}
      title='UPort Login'
      actions={[
        <Button color='error' onClick={onCancel}>Cancel</Button>,
        <Button onClick={() => start()}>Retry</Button>
      ]}
    >
      _id: {_id}
      state: {state}
      token: {token}
      {qr && <img src={qr}></img>}
    </Modal>
  )
}