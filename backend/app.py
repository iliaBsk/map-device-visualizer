
from flask import Flask, jsonify
from flask_cors import CORS
import os
from datetime import datetime, timedelta
from influxdb_client import InfluxDBClient
import random

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# InfluxDB connection settings
INFLUXDB_URL = os.environ.get("INFLUXDB_URL", "http://localhost:8086")
INFLUXDB_TOKEN = os.environ.get("INFLUXDB_TOKEN", "your_token_here")
INFLUXDB_ORG = os.environ.get("INFLUXDB_ORG", "your_org")
INFLUXDB_BUCKET = os.environ.get("INFLUXDB_BUCKET", "positioning")

# Sample device types (for demonstration purposes)
DEVICE_TYPES = {
    "AA:BB:CC:DD:EE:01": "anchor",
    "AA:BB:CC:DD:EE:02": "anchor",
    "AA:BB:CC:DD:EE:03": "anchor",
    "AA:BB:CC:DD:EE:04": "sensor",
    "AA:BB:CC:DD:EE:05": "sensor",
    "AA:BB:CC:DD:EE:06": "sensor",
    "AA:BB:CC:DD:EE:07": "sensor",
    "AA:BB:CC:DD:EE:08": "sensor",
}

# Color index mapping for sensors
COLOR_INDICES = {
    "AA:BB:CC:DD:EE:04": 1,
    "AA:BB:CC:DD:EE:05": 2,
    "AA:BB:CC:DD:EE:06": 3,
    "AA:BB:CC:DD:EE:07": 4,
    "AA:BB:CC:DD:EE:08": 5,
}

def get_positions(client):
    """Query latest positions from InfluxDB"""
    query_api = client.query_api()
    
    # Query last 30 seconds of data
    query = '''
        from(bucket: "positioning")
            |> range(start: -30s)
            |> filter(fn: (r) => r["_measurement"] == "positions")
            |> filter(fn: (r) => r["_field"] == "x" or r["_field"] == "y")
            |> yield(name: "last")
    '''
    
    result = query_api.query(query)
    
    positions = {}
    for table in result:
        for record in table.records:
            device_id = record.values.get('device_mac')
            if device_id not in positions:
                positions[device_id] = {}
            if record.values.get('_field') == 'x':
                positions[device_id]['x'] = record.values.get('_value')
            elif record.values.get('_field') == 'y':
                positions[device_id]['y'] = record.values.get('_value')
    
    print(positions)
    return positions

def get_historical_positions(client, start_time, end_time):
    """Query historical positions from InfluxDB within a time range"""
    query_api = client.query_api()
    
    # Format times for InfluxDB query
    start_str = start_time.strftime("%Y-%m-%dT%H:%M:%SZ")
    end_str = end_time.strftime("%Y-%m-%dT%H:%M:%SZ")
    
    query = f'''
        from(bucket: "positioning")
            |> range(start: {start_str}, stop: {end_str})
            |> filter(fn: (r) => r["_measurement"] == "positions")
            |> filter(fn: (r) => r["_field"] == "x" or r["_field"] == "y")
    '''
    
    result = query_api.query(query)
    
    # Store positions with timestamps
    historical_data = []
    temp_positions = {}
    
    for table in result:
        for record in table.records:
            device_id = record.values.get('device_mac')
            timestamp = record.values.get('_time')
            
            # Create a key that combines device_id and timestamp
            position_key = f"{device_id}_{timestamp}"
            
            if position_key not in temp_positions:
                temp_positions[position_key] = {
                    "deviceId": device_id,
                    "timestamp": timestamp.isoformat(),
                    "x": None,
                    "y": None
                }
                
            if record.values.get('_field') == 'x':
                temp_positions[position_key]['x'] = record.values.get('_value')
            elif record.values.get('_field') == 'y':
                temp_positions[position_key]['y'] = record.values.get('_value')
    
    # Convert to list, filtering out incomplete records
    for position in temp_positions.values():
        if position['x'] is not None and position['y'] is not None:
            historical_data.append(position)
    
    return historical_data

@app.route('/api/devices', methods=['GET'])
def get_devices():
    """Get all devices with their current positions"""
    try:
        client = InfluxDBClient(
            url=INFLUXDB_URL,
            token=INFLUXDB_TOKEN,
            org=INFLUXDB_ORG
        )
        
        # Get raw positions from InfluxDB
        position_data = get_positions(client)
        
        # Format data for frontend
        devices = []
        for mac, pos in position_data.items():
            if 'x' in pos and 'y' in pos:
                device_type = DEVICE_TYPES.get(mac, "sensor")  # Default to sensor
                device = {
                    "id": mac.replace(":", ""),  # Use MAC without colons as ID
                    "mac": mac,
                    "type": device_type,
                    "x": pos['x'],
                    "y": pos['y'],
                    "lastSeen": datetime.now().isoformat(),
                    "colorIndex": COLOR_INDICES.get(mac, 1) if device_type == "sensor" else 0
                }
                devices.append(device)
        
        client.close()
        return jsonify(devices)
    
    except Exception as e:
        print(f"Error getting devices: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/historical-positions', methods=['GET'])
def get_historical():
    """Get historical position data within a time range"""
    try:
        from flask import request
        
        # Get time range parameters
        start_time_str = request.args.get('startTime')
        end_time_str = request.args.get('endTime')
        
        if not start_time_str or not end_time_str:
            return jsonify({"error": "startTime and endTime query parameters are required"}), 400
        
        # Parse datetime parameters
        start_time = datetime.fromisoformat(start_time_str.replace('Z', '+00:00'))
        end_time = datetime.fromisoformat(end_time_str.replace('Z', '+00:00'))
        
        client = InfluxDBClient(
            url=INFLUXDB_URL,
            token=INFLUXDB_TOKEN,
            org=INFLUXDB_ORG
        )
        
        historical_data = get_historical_positions(client, start_time, end_time)
        client.close()
        
        return jsonify(historical_data)
    
    except Exception as e:
        print(f"Error getting historical positions: {e}")
        return jsonify({"error": str(e)}), 500

# Mock data generation endpoint for testing without InfluxDB
@app.route('/api/mock-devices', methods=['GET'])
def get_mock_devices():
    """Generate mock device data for testing"""
    mock_devices = [
        {"id": "1", "mac": "AA:BB:CC:DD:EE:01", "type": "anchor", "x": 150, "y": 200, "lastSeen": datetime.now().isoformat(), "colorIndex": 0},
        {"id": "2", "mac": "AA:BB:CC:DD:EE:02", "type": "anchor", "x": 450, "y": 150, "lastSeen": datetime.now().isoformat(), "colorIndex": 0},
        {"id": "3", "mac": "AA:BB:CC:DD:EE:03", "type": "anchor", "x": 750, "y": 300, "lastSeen": datetime.now().isoformat(), "colorIndex": 0},
        {"id": "4", "mac": "AA:BB:CC:DD:EE:04", "type": "sensor", "x": 200 + random.randint(-10, 10), "y": 250 + random.randint(-10, 10), "lastSeen": datetime.now().isoformat(), "colorIndex": 1},
        {"id": "5", "mac": "AA:BB:CC:DD:EE:05", "type": "sensor", "x": 500 + random.randint(-10, 10), "y": 400 + random.randint(-10, 10), "lastSeen": datetime.now().isoformat(), "colorIndex": 2},
        {"id": "6", "mac": "AA:BB:CC:DD:EE:06", "type": "sensor", "x": 600 + random.randint(-10, 10), "y": 200 + random.randint(-10, 10), "lastSeen": datetime.now().isoformat(), "colorIndex": 3},
        {"id": "7", "mac": "AA:BB:CC:DD:EE:07", "type": "sensor", "x": 300 + random.randint(-10, 10), "y": 350 + random.randint(-10, 10), "lastSeen": datetime.now().isoformat(), "colorIndex": 4},
        {"id": "8", "mac": "AA:BB:CC:DD:EE:08", "type": "sensor", "x": 700 + random.randint(-10, 10), "y": 250 + random.randint(-10, 10), "lastSeen": datetime.now().isoformat(), "colorIndex": 5},
    ]
    return jsonify(mock_devices)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
