import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Dispatch() {
  const [dispatches, setDispatches] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/dispatch")
      .then((data) => data.json())
      .then((json) => {
        setDispatches(json);
      });
  });

  if (dispatches.length > 0) {
    return <>Dispatch information</>;
  } else {
    return <>No vehicles currently dispatched. Add one to get started!</>;
  }
}
