import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "../context/AuthContext.jsx"

import AuthPage from '../pages/Authpage.jsx'
import NotFoundPage from "../components/NotFoundPage.jsx"
import Test from "../pages/Test.jsx"
import Home from "../pages/Home.jsx"
import Profile from "../pages/Profile.jsx"
import ForgetPassword from "../pages/ForgetPassword.jsx"
import PostPage from "../pages/PostPage.jsx"
import WritePage from "../pages/WritePage.jsx"
import BookMarksPage from "../pages/BookMarksPage.jsx"
import MyPostsPage from "../pages/MyPostsPage.jsx"
import PublicProfile from "../pages/PublicProfile.jsx"
import NotificationsPage from "../pages/Notification.jsx"
import AccountRecovery from '../pages/AccountRecovery.jsx'

import PublicRoute from "../components/PublicRoute.jsx"
import ProtectedRoute from "../components/ProtectedRoute.jsx"
import MainLayout from "../Layout/MainLayout.jsx"

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          <Route element={<PublicRoute />}>
            <Route path='/auth' element={<AuthPage />} />
            <Route path='/recover' element={<ForgetPassword/>} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout/>}>
              <Route path='/home' element={<Home />} />
              <Route path='my-posts' element={<MyPostsPage/>} />
              <Route path='/post/:uuid' element={<PostPage/>} />
              <Route path='/write' element={<WritePage/>} />
              <Route path='/bookmarks' element={<BookMarksPage/>} />
              <Route path='/profile' element={<Profile />} />
              <Route path='/notifications' element={<NotificationsPage/>} />
              <Route path='/recover' element={<AccountRecovery/>} />
              <Route path='/u/:username' element={<PublicProfile/>} />
              <Route path='/test' element={<Test />} />
            </Route>
          </Route>

          <Route path='/' element={<Navigate to="/home" replace />} />

          <Route path='*' element={<NotFoundPage />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>

  )
}

export default App