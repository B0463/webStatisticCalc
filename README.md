# Web Statistic Calc

This project is a simple Express-based API server that fetches historical weather data using the Open-Meteo API and computes basic statistics like mean, median, mode, standard deviation, quartiles, and more.

It is designed to provide a single HTTP endpoint where you can submit a request with a location and date range, and receive weather data with statistical analysis.

## Features

- Fetches hourly temperature data from Open-Meteo
- Computes statistics from the data
- Built with Express and TypeScript
- Organized for modularity and extensibility

## API Usage

Send a POST request to the following endpoint:

**POST** `/api/temperature`

Request body format:

```json
{
    "latitude": 10,
    "longitude": 10,
    "start_date": "1990-01-01",
    "end_date": "1990-01-02"
}
```

Response format:

```json
{
    "timestamps": [
        "1990-01-01T00:00",
        "1990-01-01T01:00"
        // ...
    ],
    "temperatures": [
        17.5,
        16.9
        // ...
    ],
    "statistics": {
        "mean": 23.4,
        "median": 23,
        "mode": [
            30.8
        ],
        "variance": 33.9,
        "stdDev": 5.8,
        "min": 14.4,
        "max": 31.6,
        "quartiles": {
            "q1": 17.65,
            "q2": 23,
            "q3": 29.3
        },
        "iqr": 11.6
    }
}
```

## How to Run

1. Clone the repository

   ```bash
   git clone https://github.com/B0463/webStatisticCalc.git
   cd webStatisticCalc
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Compile TypeScript server to JavaScript, and remove development dependencies

   ```bash
   cd server
   npx tsc
   cd ..
   npm uninstall --save-dev
   ```
4. Run the server

   ```bash
   node server/dist/main.js  
   ```

The server will be available at `http://localhost:PORT/`

---

Feel free to extend the API with other weather variables, additional statistical metrics, or caching.
