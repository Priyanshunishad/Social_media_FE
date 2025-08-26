import React from 'react'
import { Route, Routes } from 'react-router'
import Home from './pages/Home'
import MainLayout from './layout/MainLayout'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Profile from './components/Profile'
import  { Toaster } from 'react-hot-toast';
import CreatePostModal from './components/CreatePost'
import CreatePostPage from './components/CreatePost'
// import CreatePost from './components/CreatePost'

const App = () => {
  return (<>
     <Routes>
      <Route path="/" element={<MainLayout />} >
        {/* <Route  element={<Home/>}/> */}
        <Route path='' element={<Home/>}/>
        <Route path='/signup' element={<Signup/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/profile/:username'  element={<Profile/>}/>
        <Route path='/create-post'  element={<CreatePostPage/>}/>
      
      </Route>
    </Routes>
    <Toaster 
     position="right-bottom"/>
    </>
  )
}

export default App