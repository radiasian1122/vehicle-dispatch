import '../styles/dispatchForm.css'

export default function DispatchForm() {


    return (
        <>
            <header className="main-header flex">
                <h1>{localStorage.getItem('username')}</h1>
            </header>
            <main className="main-content flex">
                <div className="vehicle-list-header flex">
                    <button className="add-vehicles-button">Add Vehicles</button>
                    <button type="submit">Submit</button>
                </div>
                <form className="main-dispatch-form-container flex">

                    <table className="dispatch-table">
                        <thead>
                        <tr>
                            <th scope="col">Vehicle Type</th>
                            <th scope="col">Callsign</th>
                            <th scope="col">First Name</th>
                            <th scope="col">Sign Out Date</th>
                            <th scope="col">Return Date</th>
                            <th scope="col">Status</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <th scope="row">Something</th>
                            <td>1</td>

                            <td>11</td>
                            <td>1</td>
                            <td>1</td>
                            <td>1</td>
                        </tr>

                        </tbody>
                    </table>

                    <div className="vehicle-list-footer flex">
                        <button>Cancel</button>
                    </div>

                </form>
            </main>

        </>
    )
}