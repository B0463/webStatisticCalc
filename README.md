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

**POST** `/weather`

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
    "timestamps": [...],
    "temperatures": [...],
    "statistics": {
        "mean": ...,
        "median": ...,
        "mode": [...],
        "variance": ...,
        "stdDev": ...,
        "min": ...,
        "max": ...,
        "quartiles": {
        "q1": ...,
        "q2": ...,
        "q3": ...
        },
        "iqr": ...
    }
}
```

## How to Run

1. Clone the repository
2. Enter the server directory

   ```bash  
   cd server  
   ```

3. Install dependencies

   ```bash
   npm install  
   ```

4. Compile TypeScript to JavaScript

   ```bash
   npx tsc  
   ```

5. Optionally, remove development dependencies

   ```bash
   npm uninstall --save-dev  
   ```

6. Go back to root folder (if needed)

   ```bash
   cd ..  
   ```

7. Run the server

   ```bash
   node server/dist/main.js  
   ```

The server will be available at `http://localhost:PORT/weather`

---

Feel free to extend the API with other weather variables, additional statistical metrics, or caching.
