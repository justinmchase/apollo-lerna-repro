import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'

const App = dynamic(() => import('../components/app'))

export default function Home() {
  const router = useRouter()
  const { page } = router.query
  return (
    <App page={page} />
  )
}