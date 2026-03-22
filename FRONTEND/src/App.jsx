import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Route, Routes, useLocation } from 'react-router-dom'
import Signup from './Components/Signup'
import Login from './Components/Login'
import Home from './Components/Home'
import Navbar from './Components/Navbar'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import ProtectedRoute from './Components/ProtectedRoute'
import Userdash from './Components/Userdash'

import AssignTask from './Components/AssignTask'
import Awardpoints from './Components/Awardpoints'
import ProfileUpdate from './Components/ProfileUpdate'
import AdminDashboard from './Components/AdminDashboard'
import FacultyDashboard from './Components/FacultyDashboard'
import StoreVerify from './Components/StoreVerify'
import AdminRoleManager from './Components/AdminRoleManager'

import Footer from './Components/Footer'
import AboutUs from './Components/AboutUs'
import ContactUs from './Components/ContactUs'
import StudentTasks from './Components/StudentTasks'
import Events from './Components/Events'

function AppContent() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <AuthProvider>
      <div className={`flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300 ${!isHome ? 'pt-16' : ''}`}>
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path='/' element={<Home />} />
              <Route path='/s' element={<Signup />} />
              <Route path='/L' element={<Login />} />
              <Route path='/about' element={<AboutUs />} />
              <Route path='/contact' element={<ContactUs />} />
              <Route path='/events' element={<Events />} />
              <Route path='/user' element={<ProtectedRoute allowedRoles={["user"]}><Userdash /></ProtectedRoute>} />
              <Route path='/tsk' element={<ProtectedRoute allowedRoles={["admin", "faculty"]}><AssignTask /></ProtectedRoute>} />
              <Route path='/award' element={<ProtectedRoute allowedRoles={["admin", "faculty"]}><Awardpoints /></ProtectedRoute>} />
              <Route path='/profile' element={<ProtectedRoute allowedRoles={["user", "admin", "store", "faculty"]}><ProfileUpdate /></ProtectedRoute>} />
              <Route path='/admin' element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
              <Route path='/faculty' element={<ProtectedRoute allowedRoles={["admin", "faculty"]}><FacultyDashboard /></ProtectedRoute>} />
              <Route path='/store' element={<ProtectedRoute allowedRoles={["store"]}><StoreVerify /></ProtectedRoute>} />
              <Route path="/admin/roles" element={<ProtectedRoute allowedRoles={["admin"]}><AdminRoleManager /></ProtectedRoute>} />
              <Route path="/tasks" element={<ProtectedRoute allowedRoles={["user"]}><StudentTasks /></ProtectedRoute>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
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
