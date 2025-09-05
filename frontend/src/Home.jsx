import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "../styles/DispatchTable.css";
import "../styles/Home.css";

export default function Dispatch() {
  const [dispatches, setDispatches] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/dispatch")
      .then((data) => data.json())
      .then((json) => {
        setDispatches(json);
      });
  }, []);

  if (dispatches.length > 0) {
    return (
      <>
        {dispatches.map((dispatch) => {
          return (
            <table className="dispatch-container">
              <caption>
                <h2>Dispatch Overview</h2>
              </caption>
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
                  <th scope="row">{dispatch.type}</th>
                  <td>{dispatch.callsign}</td>

                  <td>{dispatch.first_name}</td>
                  <td>{dispatch.sign_out}</td>
                  <td>{dispatch.sign_in}</td>
                  <td>{dispatch.status}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <th scope="row" colSpan="5">
                    Total vehicles signed out or pending
                  </th>
                  <td>{dispatches.length}</td>
                </tr>
              </tfoot>
            </table>
          );
        })}
        {/* <Link to={"/dispatch-form"}>Add Dispatch</Link> */}
      </>
    );
  } else {
    return <>No vehicles currently dispatched. Add one to get started!</>;
  }
}
