import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./Login.jsx";
import Home from "./Home.jsx";
import DispatchForm from "./DispatchForm.jsx"
import "./App.css";

function App() {
  return (
    <>
      <Routes>
        <Route index element={<Login />} />
        <Route path="/home" element={<Home />} />
          <Route path="/dispatch-form" element={<DispatchForm/>} />
      </Routes>
    </>
  );
}

export default App;
