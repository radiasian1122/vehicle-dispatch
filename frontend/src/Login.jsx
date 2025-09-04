import "../styles/Login.css"


function Login() {
    return (
        <>
            <div className="main-container flex">
            <header className="main-header flex">
                <h1>Vehicle Tracker</h1>
            </header>
            <form className="login-form flex">
                <div>
                    <label htmlFor="username-input">Username:</label>
                </div>
                    <input type="text" id="username-input" className="form-input"/>

                <div>
                    <label htmlFor="password-input">Password:</label>
                </div>
                    <input type="password" id="password-input" className="form-input"/>

            </form>
            </div>
        </>
    )
}

export default Login;