import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from './pages/dashboard.jsx';
import MonthlyExpense from './pages/MonthlyExpense.jsx';
import Signup from "./pages/Signup.jsx";
import Forums from "./pages/Forums.jsx";
import Stocks from "./pages/Stocks.jsx";

// import NotFound from "./pages/NotFound.jsx";

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'login', element: <Login /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'monthly-expense', element: <MonthlyExpense /> },
      { path: 'signup', element: <Signup /> },
       { path: "forums", element: <Forums /> },
       { path: 'stocks', element: <Stocks /> }

      // { path: '*', element: <NotFound /> },
    ],
  },
]);


createRoot(document.getElementById('root')).render(
  <StrictMode>
   <RouterProvider router={router} />
  </StrictMode>,
)