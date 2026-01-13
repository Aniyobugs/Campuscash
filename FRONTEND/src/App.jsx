import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Route, Routes } from 'react-router-dom'
import Signup from './Components/Signup'
import Login from './Components/Login'
import Home from './Components/Home'
import Navbar from './Components/Navbar'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { useTheme } from './contexts/ThemeContext'
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { lightTheme, darkTheme } from './theme/muiTheme'
import ProtectedRoute from './Components/ProtectedRoute'
import Userdash from './Components/Userdash'
import { Task } from '@mui/icons-material'
import AssignTask from './Components/AssignTask'
import Awardpoints from './Components/Awardpoints'
import ProfileUpdate from './Components/ProfileUpdate'
import AdminDashboard from './Components/AdminDashboard'
import FacultyDashboard from './Components/FacultyDashboard'
import StoreVerify from './Components/StoreVerify'
import AdminRoleManager from './Components/AdminRoleManager'

function AppContent() {
  const { isDark } = useTheme()
  const muiTheme = isDark ? darkTheme : lightTheme

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path ='/' element={<Home/>}/>
          <Route path ='/s' element={<Signup/>}/>
          <Route path ='/L' element={<Login/>}/>
          <Route path ='/user' element={<ProtectedRoute allowedRoles={["user"]}><Userdash/></ProtectedRoute>} />
          <Route path ='/tsk' element={<ProtectedRoute allowedRoles={["admin","faculty"]}><AssignTask/></ProtectedRoute>} />
          <Route path ='/award' element={<ProtectedRoute allowedRoles={["admin","faculty"]}><Awardpoints/></ProtectedRoute>} />
          <Route path ='/profile' element={<ProtectedRoute allowedRoles={["user","admin","store","faculty"]}><ProfileUpdate/></ProtectedRoute>} />
          <Route path ='/admin' element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard/></ProtectedRoute>} />
          <Route path ='/faculty' element={<ProtectedRoute allowedRoles={["admin","faculty"]}><FacultyDashboard/></ProtectedRoute>} />
          <Route path ='/store' element={<ProtectedRoute allowedRoles={["store"]}><StoreVerify/></ProtectedRoute>} />
          <Route path="/admin/roles" element={<ProtectedRoute allowedRoles={["admin"]}><AdminRoleManager /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </MuiThemeProvider>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}

export default App
    