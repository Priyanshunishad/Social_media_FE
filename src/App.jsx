import React from 'react'
import { Navigate, Route, Routes } from 'react-router'
import Home from './pages/Home'
import MainLayout from './layout/MainLayout'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Profile from './components/Profile'
import  { Toaster } from 'react-hot-toast';
import CreatePostModal from './components/CreatePost'
import CreatePostPage from './components/CreatePost'
import Search from './components/Search'
import ProtectedRoute from './routes/ProtectedRoutes'
import PublicRoute from './routes/PublicRoute'
import Explore from './components/Explore'
import Message from './components/Message'
import AdminLogin from './pages/AdminLogin'

// import CreatePost from './components/CreatePost'

const App = () => {
  return (<>
     <Routes>
      <Route path="/" element={<MainLayout />} >
        {/* <R  element={<Home/>}/> */}
        <Route path='' element={<ProtectedRoute><Home/></ProtectedRoute>}/>
        <Route path='/signup' element={<PublicRoute><Signup/></PublicRoute>}/>
        <Route path='/login' element={<PublicRoute><Login/></PublicRoute>}/>
        <Route path='/admin' element={<PublicRoute><AdminLogin/></PublicRoute>}/>
        <Route path='/profile/:username'  element={<ProtectedRoute><Profile/></ProtectedRoute>}/>
        <Route path='/create-post'  element={<ProtectedRoute><CreatePostPage/></ProtectedRoute>}/>
        <Route path='/search'  element={<ProtectedRoute><Search/></ProtectedRoute>}/>
        <Route path='/explore'  element={<ProtectedRoute><Explore/></ProtectedRoute>}/>
        <Route path="/message" element={<ProtectedRoute><Message/></ProtectedRoute>} />

          {/* ✅ Catch-all Route */}
          {/* <Route path="*" element={<NotFound />} /> */}
          <Route path="*" element={<Navigate to="/" replace />} />
      
      </Route>
    </Routes>
    <Toaster 
     position="right-bottom"/>
    </>
  )
}

export default App