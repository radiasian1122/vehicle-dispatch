export function generateVehicles(){
    const vehicleTypes = ['JLTV', '1.1', 'STRYKER', 'MRZR', 'ISV', 'LMTV', 'TLC', 'RFSS', 'QUAD']
    let vehicles = []
    for (let i = 0; i < vehicleTypes.length; i++){
        for (let j = 0; j < 10; j++){
            vehicles.push({
                type: vehicleTypes[i],
                callsign: `${vehicleTypes[i]}-0${j}`,
                company: 'C',
                status: 'available'
            })
        }
    }
    return vehicles;
}


