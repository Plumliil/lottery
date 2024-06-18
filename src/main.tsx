import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import DataImport from './pages/dataImport'
import Home from './pages/home'


const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: '/dataImport',
    element: <DataImport />
  }
]);
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
