export interface UptimeData {
    uptime: number; // Service uptime in seconds
}

export interface FormattedUptimeData {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
} 