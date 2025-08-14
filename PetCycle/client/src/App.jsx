import { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap CSS 임포트
import { RouterProvider } from 'react-router-dom'
import root from './router/root'

function App() {
  const [count, setCount] = useState(0)

  return (
    <RouterProvider router={root} />
  )
}

export default App
