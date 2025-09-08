import {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom'


import '../styles/dispatchForm.css'

export default function DispatchForm() {

    const [hasItems, setHasItems] = useState(false);
    const navigate = useNavigate();


    useEffect(() => {
        if (localStorage.getItem("selectedVehicles")) {
            setHasItems(true);
        }
    }, [])

    return (
        <>

            <main className="main-content flex">
                <div className="vehicle-list-header flex">
                    <button onClick={() => navigate('/vehicles')} className="add-vehicles-button">Add Vehicles</button>
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
                            {hasItems &&
                                <>
                                    <th scope="row">Something</th>
                                    <td>1</td>

                                    <td>11</td>
                                    <td>1</td>
                                    <td>1</td>
                                    <td>1</td>
                                </> ||
                                <td className="dispatch-form-placeholder">No vehicles added to dispatch</td>

                            }

                        </tr>

                        </tbody>
                    </table>

                    <div className="vehicle-list-footer flex">
                        <button onClick={(e) => {
                            e.preventDefault();
                            navigate("/home");
                        }}>Cancel</button>
                    </div>

                </form>
            </main>

        </>
    )
}