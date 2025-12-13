"""
Container Manager - Spawns Docker containers for individual ride requests
Each ride runs in its own container on a unique port (7000, 7001, 7002, ...)
"""

import subprocess
import json
from typing import Dict, Optional
from datetime import datetime
import threading


class RideContainerManager:
    """Manages Docker containers for individual rides"""
    
    def __init__(self, start_port: int = 7000):
        """Initialize the container manager"""
        self.start_port = start_port
        self.current_port = start_port
        self.active_containers: Dict[int, Dict] = {}  # ride_id -> container info
        self.port_lock = threading.Lock()
        
    def get_next_port(self) -> int:
        """Get the next available port"""
        with self.port_lock:
            port = self.current_port
            self.current_port += 1
            return port
    
    def spawn_ride_container(self, ride_id: int, ride_data: Dict, priority: str = "normal") -> Dict:
        """
        Spawn a new Docker container for a ride request
        
        Args:
            ride_id: The unique ride ID
            ride_data: Dictionary containing ride information
            priority: "normal" or "emergency" - affects resource allocation
            
        Returns:
            Dictionary with container information including port mapping
        """
        port = self.get_next_port()
        container_name = f"uber-ride-{ride_id}"
        
        # Set resource limits based on priority
        if priority == "emergency":
            cpus = "1.0"  # More CPU for emergency rides
            memory = "512m"  # More memory
            priority_label = "🚨 EMERGENCY"
        else:
            cpus = "0.5"
            memory = "256m"
            priority_label = "🚗 NORMAL"
        
        try:
            # Build the Docker run command
            # Using the existing server image
            docker_cmd = [
                "docker", "run",
                "-d",  # Detached mode
                "--name", container_name,
                "-p", f"{port}:8000",  # Map host port to container port 8000
                "--cpus", cpus,
                "--memory", memory,
                "-e", f"RIDE_ID={ride_id}",
                "-e", f"RIDE_DATA={json.dumps(ride_data)}",
                "-e", f"PRIORITY={priority}",
                "-e", "DATABASE_URL=postgresql://postgres:SHER@host.docker.internal:5433/uber_db",
                "--network", "bridge",
                "uber_one_clone-server:latest"  # Use existing image
            ]
            
            # Execute the command
            result = subprocess.run(
                docker_cmd,
                capture_output=True,
                text=True,
                check=True
            )
            
            container_id = result.stdout.strip()
            
            # Store container information
            container_info = {
                'ride_id': ride_id,
                'container_id': container_id,
                'container_name': container_name,
                'host_port': port,
                'internal_port': 8000,
                'ride_data': ride_data,
                'priority': priority,
                'started_at': datetime.now().isoformat(),
                'status': 'running',
                'url': f'http://localhost:{port}'
            }
            
            self.active_containers[ride_id] = container_info
            
            # Print mapping
            print(f"\n{'='*70}")
            print(f"{priority_label} RIDE CONTAINER SPAWNED")
            print(f"{'='*70}")
            print(f"📋 Ride ID: {ride_id}")
            print(f"⚡ Priority: {priority.upper()}")
            print(f"🔌 Port Mapping: {port} (host) → 8000 (container)")
            print(f"💻 Resources: {cpus} CPUs, {memory} RAM")
            print(f"🐳 Container ID: {container_id[:12]}")
            print(f"🌐 Access URL: http://localhost:{port}")
            print(f"👤 User ID: {ride_data.get('user_id', 'N/A')}")
            print(f"📍 From: {ride_data.get('pickup_location', 'N/A')}")
            print(f"🎯 To: {ride_data.get('drop_location', 'N/A')}")
            print(f"{'='*70}\n")
            
            return container_info
            
        except subprocess.CalledProcessError as e:
            error_msg = f"Failed to spawn container: {e.stderr}"
            print(f"❌ Error: {error_msg}")
            raise Exception(error_msg)
        except Exception as e:
            print(f"❌ Unexpected error: {str(e)}")
            raise
    
    def stop_ride_container(self, ride_id: int) -> bool:
        """Stop and remove a ride container"""
        if ride_id not in self.active_containers:
            return False
        
        container_info = self.active_containers[ride_id]
        container_name = container_info['container_name']
        
        try:
            # Stop the container
            subprocess.run(
                ["docker", "stop", container_name],
                capture_output=True,
                check=True
            )
            
            # Remove the container
            subprocess.run(
                ["docker", "rm", container_name],
                capture_output=True,
                check=True
            )
            
            print(f"🛑 Stopped ride container: {ride_id} on port {container_info['host_port']}")
            
            # Remove from active containers
            del self.active_containers[ride_id]
            
            return True
            
        except subprocess.CalledProcessError as e:
            print(f"❌ Error stopping container: {e.stderr}")
            return False
    
    def get_container_info(self, ride_id: int) -> Optional[Dict]:
        """Get information about a specific ride container"""
        return self.active_containers.get(ride_id)
    
    def get_all_active_containers(self) -> Dict[int, Dict]:
        """Get all active ride containers"""
        return self.active_containers.copy()
    
    def get_container_logs(self, ride_id: int, tail: int = 50) -> Optional[str]:
        """Get logs from a ride container"""
        if ride_id not in self.active_containers:
            return None
        
        container_name = self.active_containers[ride_id]['container_name']
        
        try:
            result = subprocess.run(
                ["docker", "logs", "--tail", str(tail), container_name],
                capture_output=True,
                text=True,
                check=True
            )
            return result.stdout
        except subprocess.CalledProcessError:
            return None
    
    def cleanup_all_containers(self):
        """Stop and remove all ride containers"""
        print("🧹 Cleaning up all ride containers...")
        
        ride_ids = list(self.active_containers.keys())
        for ride_id in ride_ids:
            self.stop_ride_container(ride_id)
        
        print("✅ Cleanup complete")


# Global instance of the container manager
container_manager = RideContainerManager(start_port=7000)
