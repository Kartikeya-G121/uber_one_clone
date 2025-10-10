const API_BASE = 'http://localhost:8000';

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
    
    if (!data.user_id || !data.pickup_location || !data.drop_location) {
        document.getElementById('rideStatus').innerHTML = '❌ Please fill in all required fields';
        return;
    }
    
    try {
        document.getElementById('rideStatus').innerHTML = '🔄 Requesting ride with dedicated container...';
        
        // Use the new container-enabled endpoint
        const response = await fetch(`${API_BASE}/request_ride_container`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            document.getElementById('rideStatus').innerHTML = `
                ✅ <strong>Ride Requested Successfully!</strong><br>
                📍 From: ${result.pickup_location}<br>
                🎯 To: ${result.drop_location}<br>
                🕐 Requested at: ${new Date(result.created_at).toLocaleString()}<br>
                🆔 Ride ID: ${result.id}<br>
                <br>
                🐳 <strong>Dedicated Container Spawned:</strong><br>
                🔌 Container Port: ${result.container_port}<br>
                🌐 Container URL: <a href="${result.container_url}" target="_blank">${result.container_url}</a><br>
                📦 Container ID: ${result.container_id}
            `;
            
            // Add to queue automatically
            await addToQueue();
        } else {
            document.getElementById('rideStatus').innerHTML = `❌ Error: ${result.detail || 'Failed to request ride'}`;
        }
    } catch (error) {
        document.getElementById('rideStatus').innerHTML = `❌ Network Error: ${error.message}`;
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
        
        if (response.ok) {
            const currentStatus = document.getElementById('rideStatus').innerHTML;
            document.getElementById('rideStatus').innerHTML = currentStatus + `<br>📋 Added to queue - Position: ${result.queue_position}`;
        }
    } catch (error) {
        console.error('Failed to add to queue:', error);
    }
}

async function getUserRides() {
    const userId = document.getElementById('searchUserId').value;
    
    if (!userId) {
        document.getElementById('ridesResult').innerHTML = '❌ Please enter a User ID';
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/rides/${userId}`);
        const result = await response.json();
        
        if (response.ok) {
            if (result.length === 0) {
                document.getElementById('ridesResult').innerHTML = '📭 No rides found for this user';
            } else {
                let ridesHtml = `<h4>Found ${result.length} ride(s):</h4>`;
                result.forEach((ride, index) => {
                    ridesHtml += `
                        <div style="background: #f8f9fa; padding: 1rem; margin: 0.5rem 0; border-radius: 6px; border-left: 4px solid #28a745;">
                            <strong>Ride #${ride.id}</strong><br>
                            📍 From: ${ride.pickup_location}<br>
                            🎯 To: ${ride.drop_location}<br>
                            🕐 ${new Date(ride.created_at).toLocaleString()}
                        </div>
                    `;
                });
                document.getElementById('ridesResult').innerHTML = ridesHtml;
            }
        } else {
            document.getElementById('ridesResult').innerHTML = `❌ Error: ${result.detail || 'Failed to fetch rides'}`;
        }
    } catch (error) {
        document.getElementById('ridesResult').innerHTML = `❌ Network Error: ${error.message}`;
    }
}

async function getAvailableDrivers() {
    try {
        const response = await fetch(`${API_BASE}/drivers/available`);
        const result = await response.json();
        
        if (response.ok) {
            if (result.length === 0) {
                document.getElementById('driversResult').innerHTML = '🚫 No drivers available at the moment';
            } else {
                let driversHtml = `<h4>Available Drivers (${result.length}):</h4>`;
                result.forEach(driver => {
                    driversHtml += `
                        <div style="background: #f8f9fa; padding: 1rem; margin: 0.5rem 0; border-radius: 6px; border-left: 4px solid #007bff;">
                            <strong>🚗 ${driver.name}</strong><br>
                            🚙 Car: ${driver.car_no}<br>
                            📍 Status: ${driver.status}<br>
                            🆔 Driver ID: ${driver.id}
                        </div>
                    `;
                });
                document.getElementById('driversResult').innerHTML = driversHtml;
            }
        } else {
            document.getElementById('driversResult').innerHTML = `❌ Error: ${result.detail || 'Failed to fetch drivers'}`;
        }
    } catch (error) {
        document.getElementById('driversResult').innerHTML = `❌ Network Error: ${error.message}`;
    }
}

// Auto-refresh available drivers every 30 seconds
setInterval(() => {
    const driversResult = document.getElementById('driversResult');
    if (driversResult.innerHTML && !driversResult.innerHTML.includes('❌')) {
        getAvailableDrivers();
    }
}, 30000);

// Function to view all active ride containers
async function viewActiveContainers() {
    try {
        const response = await fetch(`${API_BASE}/ride_containers`);
        const result = await response.json();
        
        if (response.ok) {
            if (result.total_containers === 0) {
                document.getElementById('containersResult').innerHTML = '📭 No active ride containers';
            } else {
                let containersHtml = `<h4>Active Containers (${result.total_containers}):</h4>`;
                result.containers.forEach(container => {
                    containersHtml += `
                        <div style="background: #f8f9fa; padding: 1rem; margin: 0.5rem 0; border-radius: 6px; border-left: 4px solid #6610f2;">
                            <strong>🚗 Ride #${container.ride_id}</strong><br>
                            👤 User ID: ${container.user_id}<br>
                            📍 From: ${container.pickup}<br>
                            🎯 To: ${container.drop}<br>
                            🔌 Port: ${container.host_port}<br>
                            🌐 URL: <a href="${container.url}" target="_blank">${container.url}</a><br>
                            📦 Container: ${container.container_id}<br>
                            🕐 Started: ${new Date(container.started_at).toLocaleString()}
                        </div>
                    `;
                });
                document.getElementById('containersResult').innerHTML = containersHtml;
            }
        } else {
            document.getElementById('containersResult').innerHTML = `❌ Error: ${result.detail || 'Failed to fetch containers'}`;
        }
    } catch (error) {
        document.getElementById('containersResult').innerHTML = `❌ Network Error: ${error.message}`;
    }
}
