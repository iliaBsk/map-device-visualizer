
# Device Positioning Backend

This backend connects to InfluxDB and provides APIs for getting real-time and historical device positions.

## Setup

1. Create a virtual environment:
```
python -m venv venv
```

2. Activate the virtual environment:
```
# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate
```

3. Install dependencies:
```
pip install -r requirements.txt
```

4. Set environment variables for InfluxDB connection:
```
export INFLUXDB_URL=http://your-influxdb-server:8086
export INFLUXDB_TOKEN=your_token_here
export INFLUXDB_ORG=your_org
export INFLUXDB_BUCKET=positioning
```

5. Run the server:
```
python app.py
```

## API Endpoints

- `GET /api/devices` - Get current positions of all devices
- `GET /api/historical-positions?startTime=2023-01-01T00:00:00Z&endTime=2023-01-02T00:00:00Z` - Get historical positions within a time range
- `GET /api/mock-devices` - Get mock device data for testing without InfluxDB
