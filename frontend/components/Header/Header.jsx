import React from 'react'
import './Header.css'
import Stack from '../Stack-sdg/Stack'


const Header = () => {
  return (
    <div className='header'>
      <div className="header-contents">
        <Stack />
        <div className="header-text-tile">
          <h2>SDG Connect</h2>
          <p>Connecting local hearts, hands and resources for global change</p>
          <p>Join us in making a difference today!</p>
        </div>
       
      </div>
    </div>
  )
}

export default Header
