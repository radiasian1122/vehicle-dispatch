

//Saves vehicles to local storage
export function saveVehicles(e) {
    e.preventDefault();


    const selectedVehicles = [];

    for (let i = 0; i < e.target.length; i++){
        if (e.target[i].checked === true) {
            selectedVehicles.push({
                id: e.target[i].value,
                callsign: e.target[i].name
            })
        }
    }
    localStorage.setItem('selectedVehicles', JSON.stringify(selectedVehicles));
}