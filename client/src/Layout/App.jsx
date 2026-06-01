import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "../context/AuthContext.jsx"

import AuthPage from '../pages/Authpage.jsx'
import Test from "../pages/Test.jsx"

import ProtectedRoute from "../components/ProtectedRoute.jsx"

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/auth' element={<AuthPage />} />
          <Route element={<ProtectedRoute/>}>
            <Route path='/home' element={<Test />} />
          </Route>
          <Route path='*' element={<Navigate to="/auth" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>

  )
}

export default App