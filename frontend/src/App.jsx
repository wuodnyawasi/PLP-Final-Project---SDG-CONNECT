import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from '../pages/Home/Home'
import About from '../pages/About/About'
import Contact from '../pages/Contact/Contact'
import Donate from '../pages/Donate/Donate'
import Profile from '../pages/Profile/Profile'
import Projects from '../pages/Projects/Projects'

import Admin from '../pages/Admin/Admin'
import Navbar from '../components/Navbar/Navbar'
import Footer from '../components/footer/Footer'
import OfferForm from '../components/modal/OfferForm'


const App = () => {
  return (
    <div className='app'>
      {/* Blurred background */}
      <div className='bg-blur'></div>

      {/* App content */}
      <Navbar />  
      <main>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path="/about" element={<About/>} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/donate" element={<Donate />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/projects" element={<Projects />} />

        <Route path="/admin" element={<Admin />} />
        <Route path="/offer/:category" element={<OfferForm />} />
      </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App

