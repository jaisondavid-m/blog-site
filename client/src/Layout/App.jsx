import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "../context/AuthContext.jsx"

import AuthPage from '../pages/Authpage.jsx'
import NotFoundPage from "../components/NotFoundPage.jsx"
import Test from "../pages/Test.jsx"

import PublicRoute from "../components/PublicRoute.jsx"
import ProtectedRoute from "../components/ProtectedRoute.jsx"

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          <Route element={<PublicRoute/>}>
            <Route path='/auth' element={<AuthPage />} />
          </Route>

          <Route element={<ProtectedRoute/>}>
            <Route path='/home' element={<Test />} />
          </Route>

          <Route path='/' element={ <Navigate to="/home" replace /> } />

          <Route path='*' element={<NotFoundPage />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>

  )
}

export default App