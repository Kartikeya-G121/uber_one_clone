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
        drop_location: document.getElementById('drop').value,
        pickup_lat: parseFloat(document.getElementById('pickupLat').value),
        pickup_lon: parseFloat(document.getElementById('pickupLon').value),
        drop_lat: parseFloat(document.getElementById('dropLat').value),
        drop_lon: parseFloat(document.getElementById('dropLon').value)
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

function registerBulkDrivers() {
    document.getElementById('bulkDrivers').style.display = 'block';
}

function cancelBulk() {
    document.getElementById('bulkDrivers').style.display = 'none';
    document.getElementById('bulkDriverData').value = '';
}

async function submitBulkDrivers() {
    try {
        const driversData = JSON.parse(document.getElementById('bulkDriverData').value);
        const response = await fetch(`${API_BASE}/register_drivers_bulk`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ drivers: driversData })
        });
        const result = await response.json();
        document.getElementById('driverResult').innerHTML = `<pre>${JSON.stringify(result, null, 2)}</pre>`;
        cancelBulk();
    } catch (error) {
        document.getElementById('driverResult').innerHTML = `Error: ${error.message}`;
    }
}

async function addToQueue() {
    const data = {
        user_id: parseInt(document.getElementById('userId').value),
        pickup_location: document.getElementById('pickup').value,
        drop_location: document.getElementById('drop').value,
        pickup_lat: parseFloat(document.getElementById('pickupLat').value),
        pickup_lon: parseFloat(document.getElementById('pickupLon').value),
        drop_lat: parseFloat(document.getElementById('dropLat').value),
        drop_lon: parseFloat(document.getElementById('dropLon').value)
    };
    
    try {
        const response = await fetch(`${API_BASE}/add_to_queue`, {
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

async function addDriverLocation() {
    const driverId = parseInt(document.getElementById('driverIdLoc').value);
    const lat = parseFloat(document.getElementById('driverLat').value);
    const lon = parseFloat(document.getElementById('driverLon').value);
    
    try {
        const response = await fetch(`${API_BASE}/add_driver_location?driver_id=${driverId}&latitude=${lat}&longitude=${lon}`, {
            method: 'POST'
        });
        const result = await response.json();
        document.getElementById('assignmentResult').innerHTML = `<pre>${JSON.stringify(result, null, 2)}</pre>`;
    } catch (error) {
        document.getElementById('assignmentResult').innerHTML = `Error: ${error.message}`;
    }
}

async function assignDriver() {
    try {
        const response = await fetch(`${API_BASE}/assign_driver`, {
            method: 'POST'
        });
        const result = await response.json();
        document.getElementById('assignmentResult').innerHTML = `<pre>${JSON.stringify(result, null, 2)}</pre>`;
    } catch (error) {
        document.getElementById('assignmentResult').innerHTML = `Error: ${error.message}`;
    }
}

async function getQueueStatus() {
    try {
        const response = await fetch(`${API_BASE}/queue_status`);
        const result = await response.json();
        document.getElementById('assignmentResult').innerHTML = `<pre>${JSON.stringify(result, null, 2)}</pre>`;
    } catch (error) {
        document.getElementById('assignmentResult').innerHTML = `Error: ${error.message}`;
    }
}