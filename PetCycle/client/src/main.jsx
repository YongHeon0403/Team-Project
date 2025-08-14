import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap CSS 임포트
import App from './App.jsx'
import { Provider } from 'react-redux'
import store from './store.jsx'
import { RouterProvider } from 'react-router-dom'
import root from './router/root.jsx'

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <RouterProvider router={root}>

    </RouterProvider>
  </Provider>
)
