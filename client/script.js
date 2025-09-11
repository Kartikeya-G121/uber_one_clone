const API_BASE = 'http://localhost:8000';

async function registerDriver() {
    const data = {
        name: document.getElementById('driverName').value,
        car_no: document.getElementById('carNo').value,
        status: document.getElementById('status').value
    };
    
    try {
        const response = await fetch(`${API_BASE}/register_driver`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        document.getElementById('driverResult').innerHTML = `<pre>${JSON.stringify(result, null, 2)}</pre>`;
    } catch (error) {
        document.getElementById('driverResult').innerHTML = `Error: ${error.message}`;
    }
}

async function requestRide() {
    const data = {
        user_id: parseInt(document.getElementById('userId').value),
        pickup_location: document.getElementById('pickup').value,
        drop_location: document.getElementById('drop').value
    };
    
    try {
        const response = await fetch(`${API_BASE}/request_ride`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        document.getElementById('rideResult').innerHTML = `<pre>${JSON.stringify(result, null, 2)}</pre>`;
    } catch (error) {
        document.getElementById('rideResult').innerHTML = `Error: ${error.message}`;
    }
}

async function getAllDrivers() {
    try {
        const response = await fetch(`${API_BASE}/drivers`);
        const result = await response.json();
        document.getElementById('driversResult').innerHTML = `<pre>${JSON.stringify(result, null, 2)}</pre>`;
    } catch (error) {
        document.getElementById('driversResult').innerHTML = `Error: ${error.message}`;
    }
}

async function getAvailableDrivers() {
    try {
        const response = await fetch(`${API_BASE}/drivers/available`);
        const result = await response.json();
        document.getElementById('driversResult').innerHTML = `<pre>${JSON.stringify(result, null, 2)}</pre>`;
    } catch (error) {
        document.getElementById('driversResult').innerHTML = `Error: ${error.message}`;
    }
}

async function getUserRides() {
    const userId = document.getElementById('searchUserId').value;
    try {
        const response = await fetch(`${API_BASE}/rides/${userId}`);
        const result = await response.json();
        document.getElementById('ridesResult').innerHTML = `<pre>${JSON.stringify(result, null, 2)}</pre>`;
    } catch (error) {
        document.getElementById('ridesResult').innerHTML = `Error: ${error.message}`;
    }
}