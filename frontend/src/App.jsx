import { useState } from 'react'
import { Routes, Route } from 'react-router-dom';
import Login from './Login.jsx'
import './App.css'

function App() {


  return (
    <>
        <Routes>
            <Route index element={<Login/>} />
        </Routes>
    </>
  )
}

export default App
