function mean(arr: number[]): number {
    let sum = 0;
    // Sum all values in the array
    arr.forEach((value) => {
        sum += value;
    });
    const mean = sum / arr.length; // Calculate the mean
    return mean;
}

function median(arr: number[]): number {
    const sorted = [...arr].sort((a, b) => a - b); // Sort numbers in ascending order
    const mid = Math.floor(sorted.length / 2); // Find the middle index

    if (sorted.length % 2 === 0) { // If even number of elements
        return mean([sorted[mid - 1], sorted[mid]]); // Average the two middle values
    } else { // If odd number of elements
        return sorted[mid]; // Return the middle value
    }
}

function mode(arr: number[]): number[] {
    const frequencyMap = new Map<number, number>();

    // Count the frequency of each value in the array
    arr.forEach((value) => {
        frequencyMap.set(value, (frequencyMap.get(value) || 0) + 1);
    });

    const maxFrequency = Math.max(...frequencyMap.values()); // Find the highest frequency

    const modes: number[] = [];
    const entries = frequencyMap.entries();

    // Collect all values that have the highest frequency
    for (const [value, frequency] of entries) {
        if (frequency === maxFrequency) {
            modes.push(value);
        }
    }

    return modes;
}

function variance(arr: number[]): number {
    const m = mean(arr); // Calculate the mean
    let sumOfSquares = 0;

    // Sum the squared differences from the mean
    arr.forEach((value) => {
        sumOfSquares += (value - m) ** 2;
    });

    return sumOfSquares / arr.length; // Return the variance
}

function stdDev(arr: number[]): number {
    const v = variance(arr); // Calculate the variance
    return Math.sqrt(v); // Return the standard deviation
}

function min(arr: number[]): number {
    return Math.min(...arr); // Return the smallest value in the array
}

function max(arr: number[]): number {
    return Math.max(...arr); // Return the largest value in the array
}

function quartiles(arr: number[]) {
    const sorted = [...arr].sort((a, b) => a - b); // Sort the array in ascending order

    const q2 = median(sorted); // The median is the second quartile
    const mid = Math.floor(sorted.length / 2); // Middle index

    // Split the array into lower and upper halves
    const lowerHalf = sorted.slice(0, mid);
    const upperHalf = sorted.length % 2 === 0
        ? sorted.slice(mid)
        : sorted.slice(mid + 1);

    const q1 = median(lowerHalf); // First quartile
    const q3 = median(upperHalf); // Third quartile

    return { q1, q2, q3 }; // Return quartiles as an object
}

function iqr(arr: number[]): number {
    const { q1, q3 } = quartiles(arr); // Get the first and third quartiles
    return q3 - q1; // Calculate and return the interquartile range
}

export default {
    mean,
    median,
    mode,
    variance,
    stdDev,
    min,
    max,
    quartiles,
    iqr
};
