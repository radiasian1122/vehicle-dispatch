import {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import "../styles/vehicles.css"
import {saveVehicles} from "../utils.js";

function Vehicles() {

    const [vehicleList, setVehicleList] = useState([])
    const navigate = useNavigate();


    useEffect(() => {
        fetch('http://localhost:8080/vehicles')
            .then(res => res.json())
            .then(vehicles => {
                const vehicleArray = [];

                for (let vehicle of vehicles) {
                    vehicleArray.push(vehicle);
                }

                setVehicleList(vehicleArray)
            })
    }, [])
    return (
        <main className="vehicles-component-container flex">
            <form onSubmit={(e) => {
                saveVehicles(e);
                navigate("/dispatch-form");
            }} className="vehicle-list-form">
                <h2 className="vehicles-component-header">Vehicle Inventory - Select and Add Vehicles</h2>
                <table className="vehicles-component-table">
                    <thead>
                    <tr>
                        <th>Type</th>
                        <th>Callsign</th>
                        <th>Company</th>
                        <th>Status</th>
                        <th>Select</th>
                    </tr>
                    </thead>
                    <tbody>
                    {vehicleList.map((vehicle) => {
                        return (
                            <tr>
                                <td>{vehicle.type}</td>
                                <td>{vehicle.callsign}</td>
                                <td>{vehicle.company}</td>
                                <td>{vehicle.status}</td>
                                <td><input type="checkbox" name={vehicle.callsign} value={vehicle.id}></input></td>
                            </tr>
                        )
                    })}
                    </tbody>
                </table>
                <button className="vehicles-cancel-button" onClick={(e) => {
                    e.preventDefault();
                    navigate('/dispatch-form')
                }}>Cancel
                </button>
                <button className="vehicles-component-button" type="submit">Submit</button>
            </form>
        </main>
    )
}

export default Vehicles;

