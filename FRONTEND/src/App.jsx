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
   </Routes>
    </>
    //test1
  )
}

export default App
    