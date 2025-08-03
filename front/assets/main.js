document.getElementById('calculateBtn').addEventListener('click', function() {
    // Get the input objects
    const latitude = parseFloat(document.getElementById('latitude').value);
    const longitude = parseFloat(document.getElementById('longitude').value);
    const startDate = new Date(document.getElementById('startDate').value);
    const endDate = new Date(document.getElementById('endDate').value);

    // Get the error objects
    const latError = document.getElementById('latError');
    const lonError = document.getElementById('lonError');
    const startDateError = document.getElementById('startDateError');
    const endDateError = document.getElementById('endDateError');

    // Clear previous error messages
    latError.textContent = '';
    lonError.textContent = '';
    startDateError.textContent = '';
    endDateError.textContent = '';

    // Validate inputs
    const now = new Date();
    const deltaTime = endDate.getTime() - startDate.getTime();
    const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    if(isNaN(latitude) || latitude < -90 || latitude > 90) return latError.textContent = 'Invalid latitude. Must be between -90 and 90.';
    if(isNaN(longitude) || longitude < -180 || longitude > 180) return lonError.textContent = 'Invalid longitude. Must be between -180 and 180.';
    if(startDate < new Date('1990-01-01')) return startDateError.textContent = 'Start date cannot be before 01/01/1990.';
    if(endDate > cutoff) return endDateError.textContent = "End date must be at least 24 hours before now";
    if(deltaTime < 0) return startDateError.textContent = 'Start date cannot be after end date.';
    if(deltaTime > 5 * 366 * 24 * 60 * 60 * 1000) return endDateError.textContent = 'Date range cannot exceed 5 years.';



    // call the function to create the chart
    createChart(latitude, longitude, startDate, endDate);
});

async function compressData(responseData, factor) {
    if(factor == 1) return responseData;

    // create return object
    const responseDataCompressed = {
        data: {
            timestamps: [],
            temperatures: [],
            statistics: responseData.data.statistics,
        }
    };

    // process timestemps and temperatures
    for(let i = 0; i < responseData.data.timestamps.length; i += factor) {
        // get temperature mean by factor
        let temperaturesSum = 0;
        for(let j = i; j < i+factor; j++) {
            temperaturesSum += responseData.data.temperatures[j];
        }
        const compressedTemperature = temperaturesSum / factor;

        // add data to Compressed object
        responseDataCompressed.data.timestamps.push(responseData.data.timestamps[i]);
        responseDataCompressed.data.temperatures.push(compressedTemperature);
    }

    return responseDataCompressed;
}

async function createApiRequest(latitude, longitude, startDate, endDate) {
    // create body object
    const sendData = {
        latitude: latitude,
        longitude: longitude,
        start_date: startDate.toISOString().split('T')[0], // convert to correct ISO format
        end_date: endDate.toISOString().split('T')[0]      // convert to correct ISO format
    };

    let responseData;
    try {
        // try to send data
        responseData = await axios.post("/api/temperature", sendData);
    } catch(e) {
        console.log(e);
    }

    // Compress data
    const deltaTime = endDate.getTime() - startDate.getTime();

    if(deltaTime <  3 * 30 * 24 * 60 * 60 * 1000) return await compressData(responseData, 1);
    if(deltaTime <  6 * 30 * 24 * 60 * 60 * 1000) return await compressData(responseData, 2);
    if(deltaTime <  9 * 30 * 24 * 60 * 60 * 1000) return await compressData(responseData, 3);
    if(deltaTime < 12 * 30 * 24 * 60 * 60 * 1000) return await compressData(responseData, 4);
    if(deltaTime < 18 * 30 * 24 * 60 * 60 * 1000) return await compressData(responseData, 6);
    if(deltaTime < 24 * 30 * 24 * 60 * 60 * 1000) return await compressData(responseData, 8);
    if(deltaTime < 36 * 30 * 24 * 60 * 60 * 1000) return await compressData(responseData, 12);
    if(deltaTime < 60 * 30 * 24 * 60 * 60 * 1000) return await compressData(responseData, 24);
}

let myChart = null;

async function createChart(latitude, longitude, startDate, endDate) {
    // create apirequest
    const responseData = await createApiRequest(latitude, longitude, startDate, endDate);

    // create chart
    const ctx = document.getElementById('myChart').getContext('2d');

    if(myChart) myChart.destroy(); // close chart if exist
    
    // create statistics chart datasets with datas
    const stats = responseData.data.statistics;
    const timestamps = responseData.data.timestamps;

    // update statistics section
    document.getElementById('meanValue').textContent = `Mean: ${stats.mean}`;
    document.getElementById('medianValue').textContent = `Median: ${stats.median}`;
    document.getElementById('modeValue').textContent = `Mode: ${stats.mode.join(', ')}`;
    document.getElementById('stdDevValue').textContent = `Standard Deviation: ${stats.stdDev}`;
    document.getElementById('minValue').textContent = `Min: ${stats.min}`;
    document.getElementById('maxValue').textContent = `Max: ${stats.max}`;
    document.getElementById('q1Value').textContent = `Q1: ${stats.quartiles.q1}`;
    document.getElementById('q3Value').textContent = `Q3: ${stats.quartiles.q3}`;
    document.getElementById('iqrValue').textContent = `IQR: ${stats.iqr}`;

    const datasets = [
        {
            label: 'Temperature',
            data: responseData.data.temperatures,
            borderColor: '#00e5ff',
            borderWidth: 1,
            fill: false,
            pointRadius: 0
        },
        {
            label: 'Mean',
            data: [
                { x: timestamps[0], y: stats.mean },
                { x: timestamps[timestamps.length - 1], y: stats.mean }
            ],
            tension: 0,
            borderColor: '#ff6d00',
            borderWidth: 2,
            borderDash: [5, 5],
            fill: false
        },
        {
            label: 'Median',
            data: [
                { x: timestamps[0], y: stats.median },
                { x: timestamps[timestamps.length - 1], y: stats.median }
            ],
            tension: 0,
            borderColor: '#d500f9',
            borderWidth: 2,
            borderDash: [5, 5],
            fill: false
        },
        {
            label: 'Mode',
            data: [
                { x: timestamps[0], y: stats.mode[0] },
                { x: timestamps[timestamps.length - 1], y: stats.mode[0] }
            ],
            tension: 0,
            borderColor: '#2979ff',
            borderWidth: 2,
            borderDash: [3, 3],
            fill: false
        },
        {
            label: '+1 Std Dev',
            data: [
                { x: timestamps[0], y: stats.mean + stats.stdDev },
                { x: timestamps[timestamps.length - 1], y: stats.mean + stats.stdDev }
            ],
            tension: 0,
            borderColor: '#00c853',
            borderWidth: 2,
            borderDash: [2, 2],
            fill: false
        },
        {
            label: '-1 Std Dev',
            data: [
                { x: timestamps[0], y: stats.mean - stats.stdDev },
                { x: timestamps[timestamps.length - 1], y: stats.mean - stats.stdDev }
            ],
            tension: 0,
            borderColor: '#ff1744',
            borderWidth: 2,
            borderDash: [2, 2],
            fill: false
        },
        {
            label: 'Q1',
            data: [
                { x: timestamps[0], y: stats.quartiles.q1 },
                { x: timestamps[timestamps.length - 1], y: stats.quartiles.q1 }
            ],
            tension: 0,
            borderColor: '#ffd600',
            borderWidth: 2,
            borderDash: [4, 4],
            fill: false
        },
        {
            label: 'Q3',
            data: [
                { x: timestamps[0], y: stats.quartiles.q3 },
                { x: timestamps[timestamps.length - 1], y: stats.quartiles.q3 }
            ],
            tension: 0,
            borderColor: '#ffd600',
            borderWidth: 2,
            borderDash: [4, 4],
            fill: false
        },
        {
            label: 'Min',
            data: [
                { x: timestamps[0], y: stats.min },
                { x: timestamps[timestamps.length - 1], y: stats.min }
            ],
            tension: 0,
            borderColor: '#ffffff',
            borderWidth: 2,
            borderDash: [1, 2],
            fill: false
        },
        {
            label: 'Max',
            data: [
                { x: timestamps[0], y: stats.max },
                { x: timestamps[timestamps.length - 1], y: stats.max }
            ],
            tension: 0,
            borderColor: '#ffffff',
            borderWidth: 2,
            borderDash: [1, 2],
            fill: false
        },
    ];

    // create chart
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: responseData.data.timestamps,
            datasets: datasets
        },
        options: {
            plugins: {
                legend: {
                    labels: {
                        color: '#e0e0e0'
                    }
                },
                tooltip: {
                    backgroundColor: '#333',
                    titleColor: '#fff',
                    bodyColor: '#ccc',
                    borderColor: '#555',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#e0e0e0'
                    },
                    grid: {
                        color: '#444'
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#e0e0e0'
                    },
                    grid: {
                        color: '#444'
                    }
                }
            }
        }
    });
}
