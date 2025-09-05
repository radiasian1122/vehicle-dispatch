import "../styles/Login.css"
import {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';

const [ validCredentials, setValidCredentials] = useState('false');
function Login() {


    function handleSubmit(e) {
        e.preventDefault();
        const username = e.target[0].value
        const password = e.target[1].value


        fetch('http://localhost:8080/users')
            .then(data => data.json())
            .then(users => {
                for (let user of users) {
                    if (user.username.toLowerCase() === username && user.password.toLowerCase() === password){
                        setValidCredentials("true");
                        return;
                    }else {
                        setValidCredentials("false")
                        return;
                    }
                }
            })


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

                        <button type="submit" className="login-button" onSubmit={(e) => handleSubmit(e)}>Login</button>
                    </form>
                </div>
                {validCredentials && (
                    <h1>SUCCESS!!</h1>
                )}
            </div>
        </>
    )
}

export default Login;