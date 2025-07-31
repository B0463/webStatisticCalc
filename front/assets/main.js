document.getElementById('calculateBtn').addEventListener('click', function() {
    // Get the input objects
    const latitude = parseFloat(document.getElementById('latitude').value);
    const longitude = parseFloat(document.getElementById('longitude').value);
    const startDate = new Date(document.getElementById('startDate').value);
    const endDate = new Date(document.getElementById('endDate').value);
    const now = new Date();

    // Clear previous error messages
    document.getElementById('latError').textContent = '';
    document.getElementById('lonError').textContent = '';
    document.getElementById('startDateError').textContent = '';
    document.getElementById('endDateError').textContent = '';

    // Validate latitude and longitude
    if(isNaN(latitude) || latitude < -90 || latitude > 90)
        return document.getElementById('latError').textContent = 'Invalid latitude. Must be between -90 and 90.';

    if(isNaN(longitude) || longitude < -180 || longitude > 180)
        return getElementById('lonError').textContent = 'Invalid longitude. Must be between -180 and 180.';

    // Validate dates
    if(startDate < new Date('1990-01-01'))
        return document.getElementById('startDateError').textContent = 'Start date cannot be before 01/01/1990.';
        
    if(endDate > new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1))
        return document.getElementById('endDateError').textContent = 'End date cannot be in the future.';
        
    if(startDate > endDate)
        return document.getElementById('startDateError').textContent = 'Start date cannot be after end date.';

    if((endDate - startDate) / (1000 * 60 * 60 * 24) > 30)
        return document.getElementById('endDateError').textContent = 'Date range cannot exceed 30 days.';

    // call the function to create the chart
    createChart(latitude, longitude, startDate, endDate);
});

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

    return responseData;
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
    const datasets = [
        {
            label: 'Temperature',
            data: responseData.data.temperatures,
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            fill: false
        },
        {
            label: 'Mean',
            data: [
                { x: timestamps[0], y: stats.mean },
                { x: timestamps[timestamps.length - 1], y: stats.mean }
            ],
            tension: 0,
            borderColor: 'orange',
            borderWidth: 1,
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
            borderColor: 'purple',
            borderWidth: 1,
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
            borderColor: 'blue',
            borderWidth: 1,
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
            borderColor: 'green',
            borderWidth: 1,
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
            borderColor: 'red',
            borderWidth: 1,
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
            borderColor: 'brown',
            borderWidth: 1,
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
            borderColor: 'brown',
            borderWidth: 1,
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
            borderColor: 'black',
            borderWidth: 1,
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
            borderColor: 'black',
            borderWidth: 1,
            borderDash: [1, 2],
            fill: false
        },
        {
            label: 'IRQ',
            data: [
                { x: timestamps[0], y: stats.iqr },
                { x: timestamps[timestamps.length - 1], y: stats.iqr }
            ],
            tension: 0,
            borderColor: 'teal',
            borderWidth: 1,
            borderDash: [1, 2],
            fill: false
        }
    ];

    // create chart
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: responseData.data.timestamps,
            datasets: datasets
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}
