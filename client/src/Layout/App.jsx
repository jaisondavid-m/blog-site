import React from 'react'
import { BrowserRouter , Routes , Route , Navigate } from "react-router-dom"

import Test from "../pages/Test.jsx"

function App() {
  return (
    <BrowserRouter>
        <Routes>
          <Route path='/test' element={<Test/>} />
        </Routes>
    </BrowserRouter>
  )
}

export default App