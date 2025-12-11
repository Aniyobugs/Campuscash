import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Route, Routes } from 'react-router-dom'
import Signup from './Components/Signup'
import Login from './Components/Login'
import Home from './Components/Home'
import Userdash from './Components/Userdash'
import { Task } from '@mui/icons-material'
import AssignTask from './Components/AssignTask'
import Awardpoints from './Components/Awardpoints'
import ProfileUpdate from './Components/ProfileUpdate'
import AdminDashboard from './Components/AdminDashboard'
import StoreVerify from './Components/StoreVerify'



function App() {
  const [count, setCount] = useState(0)

  return (
    <>
   <Routes>
    <Route path ='/' element={<Home/>}/>
    <Route path ='/s' element={<Signup/>}/>
     <Route path ='/L' element={<Login/>}/>
     <Route path ='/user' element={<Userdash/>}/>
     <Route path ='/tsk' element={<AssignTask/>}/>
     <Route path ='/award' element={<Awardpoints/>}/>
      <Route path ='/profile' element={<ProfileUpdate/>}/>
      <Route path ='/admin' element={<AdminDashboard/>}/>
      <Route path ='/store' element={<StoreVerify/>}/>
      
   </Routes>
    </>
    //test1
  )
}

export default App
    