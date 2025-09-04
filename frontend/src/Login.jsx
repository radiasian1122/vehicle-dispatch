import "../styles/Login.css"
import {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';



function Login() {



    function handleSubmit(e) {
        e.preventDefault();
        const submitData = {
            username: event.target[0].value,
            password: event.target[1].value
        }



    }




    return (
        <>
            <div className="main-container flex">
            <header className="main-header flex">
                <h1>Vehicle Tracker</h1>
            </header>
                <div className="form-container flex">
                    <form className="login-form flex">
                        <div>
                            <label htmlFor="username-input form-label">Username:</label>
                        </div>
                        <input type="text" id="username-input" className="form-input"/>

                        <div>
                            <label htmlFor="password-input form-label">Password:</label>
                        </div>
                        <input type="password" id="password-input" className="form-input"/>

                        <button type="submit" className="login-button" onSubmit={ (e) => handleSubmit(e)}>Login</button>
                    </form>
                </div>

            </div>
        </>
    )
}

export default Login;