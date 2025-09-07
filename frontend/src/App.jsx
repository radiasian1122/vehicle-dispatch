import {useState} from "react";
import {Routes, Route} from "react-router-dom";
import Login from "./Login.jsx";
import Home from "./Home.jsx";
import DispatchForm from "./DispatchForm.jsx"
import "./App.css";
import Vehicles from "./Vehicles.jsx";
import {useLocation} from 'react-router-dom'

function App() {

    const location = useLocation();

    return (
        <>
                <header className="main-header flex">
                    <h1>{ (location.pathname === "/" && "Vehicle Tracker") || localStorage.getItem('username')}</h1>
                </header>
            <Routes>
                <Route index element={<Login/>}/>
                <Route path="/home" element={<Home/>}/>
                <Route path="/dispatch-form" element={<DispatchForm/>}/>
                <Route path="/vehicles" element={<Vehicles/>} />
            </Routes>
        </>
    );
}

export default App;
