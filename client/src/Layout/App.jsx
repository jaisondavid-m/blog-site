import React from 'react'
import { BrowserRouter , Routes , Route , Navigate } from "react-router-dom"

import AuthPage from '../pages/Authpage.jsx'
import Test from "../pages/Test.jsx"

function App() {
  return (
    <BrowserRouter>
        <Routes>
          <Route path='/auth' element={<AuthPage/>} />
          <Route path='/test' element={<Test/>} />
        </Routes>
    </BrowserRouter>
  )
}

export default App