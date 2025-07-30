function mean(arr: number[]): number {
    const sum = arr.reduce((acc, val) => acc + val, 0);
    return sum / arr.length;
}

function median(arr: number[]): number {
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
        return (sorted[mid - 1] + sorted[mid]) / 2;
    } else {
        return sorted[mid];
    }
}

function mode(arr: number[]): number[] {
    const freqMap = new Map<number, number>();
    arr.forEach(val => freqMap.set(val, (freqMap.get(val) || 0) + 1));
    const maxFreq = Math.max(...freqMap.values());
    return [...freqMap.entries()]
        .filter(([_, freq]) => freq === maxFreq)
        .map(([val]) => val);
}

function variance(arr: number[]): number {
    const m = mean(arr);
    return arr.reduce((acc, val) => acc + (val - m) ** 2, 0) / arr.length;
}

function stdDev(arr: number[]): number {
    return Math.sqrt(variance(arr));
}

function min(arr: number[]): number {
    return Math.min(...arr);
}

function max(arr: number[]): number {
    return Math.max(...arr);
}

function quartiles(arr: number[]) {
    const sorted = [...arr].sort((a, b) => a - b);
    const q2 = median(sorted);
    const mid = Math.floor(sorted.length / 2);
    const lowerHalf = sorted.slice(0, mid);
    const upperHalf = sorted.length % 2 === 0 ? sorted.slice(mid) : sorted.slice(mid + 1);
    const q1 = median(lowerHalf);
    const q3 = median(upperHalf);
    return { q1, q2, q3 };
}

function iqr(arr: number[]): number {
    const { q1, q3 } = quartiles(arr);
    return q3 - q1;
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