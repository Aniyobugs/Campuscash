import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Route, Routes } from 'react-router-dom'
import Signup from './Components/Signup'
import Login from './Components/Login'
import Home from './Components/Home'
import { Dashboard } from '@mui/icons-material'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
   <Routes>
    <Route path ='/' element={<Home/>}/>
    <Route path ='/s' element={<Signup/>}/>
     <Route path ='/L' element={<Login/>}/>
     <Route path ='/user' element={<Dashboard/>}/>
   </Routes>
    </>
    //test
  )
}

export default App
    