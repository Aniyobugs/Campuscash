import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Route, Routes } from 'react-router-dom'
import Signup from './Components/Signup'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
   <Routes>
    <Route path ='/' element={<Signup/>}/>
   </Routes>
    </>
  )
}

export default App
