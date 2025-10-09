const API_BASE = 'http://localhost:8000';

async function registerDriver() {
    const data = {
        name: document.getElementById('driverName').value,
        car_no: document.getElementById('carNo').value,
        status: document.getElementById('status').value
    };
    
    if (!data.name || !data.car_no) {
        document.getElementById('driverResult').innerHTML = '❌ Please fill in all required fields';
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/register_driver`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            document.getElementById('driverResult').innerHTML = `
                ✅ <strong>Driver Registered Successfully!</strong><br>
                👤 Name: ${result.name}<br>
                🚗 Car: ${result.car_no}<br>
                📊 Status: ${result.status}<br>
                🆔 Driver ID: ${result.id}
            `;
            
            // Clear form
            document.getElementById('driverName').value = '';
            document.getElementById('carNo').value = '';
        } else {
            document.getElementById('driverResult').innerHTML = `❌ Error: ${result.detail || 'Registration failed'}`;
        }
    } catch (error) {
        document.getElementById('driverResult').innerHTML = `❌ Network Error: ${error.message}`;
    }
}

async function updateLocation() {
    const driverId = parseInt(document.getElementById('driverIdLoc').value);
    const lat = parseFloat(document.getElementById('driverLat').value);
    const lon = parseFloat(document.getElementById('driverLon').value);
    
    if (!driverId || !lat || !lon) {
        document.getElementById('locationResult').innerHTML = '❌ Please fill in all location fields';
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/add_driver_location?driver_id=${driverId}&latitude=${lat}&longitude=${lon}`, {
            method: 'POST'
        });
        
        const result = await response.json();
        
        if (response.ok) {
            document.getElementById('locationResult').innerHTML = `
                ✅ <strong>Location Updated!</strong><br>
                🆔 Driver ID: ${driverId}<br>
                📍 Coordinates: ${lat}, ${lon}<br>
                📊 ${result.message}
            `;
        } else {
            document.getElementById('locationResult').innerHTML = `❌ Error: ${result.detail || 'Location update failed'}`;
        }
    } catch (error) {
        document.getElementById('locationResult').innerHTML = `❌ Network Error: ${error.message}`;
    }
}

async function checkForRides() {
    try {
        const response = await fetch(`${API_BASE}/queue_status`);
        const result = await response.json();
        
        if (response.ok) {
            document.getElementById('rideManagement').innerHTML = `
                📊 <strong>Current Status:</strong><br>
                🚗 Rides in Queue: ${result.rides_in_queue}<br>
                👥 Available Drivers: ${result.available_drivers}<br>
                ${result.rides_in_queue > 0 ? '🔔 <strong>Rides available for pickup!</strong>' : '😴 No rides pending'}
            `;
        } else {
            document.getElementById('rideManagement').innerHTML = `❌ Error: ${result.detail || 'Failed to check status'}`;
        }
    } catch (error) {
        document.getElementById('rideManagement').innerHTML = `❌ Network Error: ${error.message}`;
    }
}

async function acceptRide() {
    try {
        document.getElementById('rideManagement').innerHTML = '🔄 Looking for rides to assign...';
        
        const response = await fetch(`${API_BASE}/assign_driver`, {
            method: 'POST'
        });
        
        const result = await response.json();
        
        if (response.ok) {
            document.getElementById('rideManagement').innerHTML = `
                ✅ <strong>Ride Assigned!</strong><br>
                🚗 Driver ID: ${result.driver.id}<br>
                📍 Distance: ${result.distance_km} km<br>
                ⏱️ ETA: ${result.eta_minutes} minutes<br>
                🎯 Pickup: ${result.request.pickup[0]}, ${result.request.pickup[1]}<br>
                🏁 Destination: ${result.request.destination[0]}, ${result.request.destination[1]}
            `;
        } else {
            document.getElementById('rideManagement').innerHTML = `❌ ${result.detail || 'No rides available for assignment'}`;
        }
    } catch (error) {
        document.getElementById('rideManagement').innerHTML = `❌ Network Error: ${error.message}`;
    }
}

async function getQueueStatus() {
    await checkForRides(); // Reuse the same functionality
}

async function viewAllDrivers() {
    try {
        const response = await fetch(`${API_BASE}/drivers`);
        const result = await response.json();
        
        if (response.ok) {
            if (result.length === 0) {
                document.getElementById('allDrivers').innerHTML = '📭 No drivers registered';
            } else {
                let driversHtml = `<h4>All Drivers (${result.length}):</h4>`;
                result.forEach(driver => {
                    const statusColor = driver.status === 'available' ? '#28a745' : 
                                      driver.status === 'busy' ? '#ffc107' : '#dc3545';
                    driversHtml += `
                        <div style="background: #f8f9fa; padding: 1rem; margin: 0.5rem 0; border-radius: 6px; border-left: 4px solid ${statusColor};">
                            <strong>👤 ${driver.name}</strong><br>
                            🚗 Car: ${driver.car_no}<br>
                            📊 Status: ${driver.status}<br>
                            🆔 ID: ${driver.id}
                            ${driver.latitude && driver.longitude ? `<br>📍 Location: ${driver.latitude}, ${driver.longitude}` : ''}
                        </div>
                    `;
                });
                document.getElementById('allDrivers').innerHTML = driversHtml;
            }
        } else {
            document.getElementById('allDrivers').innerHTML = `❌ Error: ${result.detail || 'Failed to fetch drivers'}`;
        }
    } catch (error) {
        document.getElementById('allDrivers').innerHTML = `❌ Network Error: ${error.message}`;
    }
}

function showBulkForm() {
    document.getElementById('bulkForm').style.display = 'block';
}

function hideBulkForm() {
    document.getElementById('bulkForm').style.display = 'none';
    document.getElementById('bulkDriverData').value = '';
}

async function submitBulkDrivers() {
    try {
        const driversData = JSON.parse(document.getElementById('bulkDriverData').value);
        
        if (!Array.isArray(driversData) || driversData.length === 0) {
            document.getElementById('driverResult').innerHTML = '❌ Please provide valid JSON array of drivers';
            return;
        }
        
        const response = await fetch(`${API_BASE}/register_drivers_bulk`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ drivers: driversData })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            document.getElementById('driverResult').innerHTML = `
                ✅ <strong>Bulk Registration Successful!</strong><br>
                👥 Registered ${result.length} drivers<br>
                🆔 Driver IDs: ${result.map(d => d.id).join(', ')}
            `;
            hideBulkForm();
        } else {
            document.getElementById('driverResult').innerHTML = `❌ Error: ${result.detail || 'Bulk registration failed'}`;
        }
    } catch (error) {
        if (error instanceof SyntaxError) {
            document.getElementById('driverResult').innerHTML = '❌ Invalid JSON format. Please check your data.';
        } else {
            document.getElementById('driverResult').innerHTML = `❌ Network Error: ${error.message}`;
        }
    }
}

// Auto-refresh queue status every 15 seconds
setInterval(() => {
    const rideManagement = document.getElementById('rideManagement');
    if (rideManagement.innerHTML && rideManagement.innerHTML.includes('Current Status')) {
        checkForRides();
    }
}, 15000);