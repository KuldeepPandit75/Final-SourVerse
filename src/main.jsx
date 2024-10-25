// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from './App.jsx'

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// )

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from "react-redux"
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom"
import store from './App/store.js'
import './index.css'
import Layout from './Layout.jsx'
import Home from './components/Home/Home.jsx'
import Verse from './Verse.jsx'

function App() {

  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path='/' element={<Layout />}>
          <Route path='' element={<Home />} />
          <Route path='/verse' element={<Verse />} />
        </Route>
      </>
    )
  )

  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  )

}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
