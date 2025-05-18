import { EventEmitter, EventType } from '../events/EventEmitter';
import { UptimeData, FormattedUptimeData } from '../models/UptimeData';
import { ApiConfig } from '../config/GameConfig';

/**
 * Service responsible for fetching and managing uptime data from remote API
 * Implements singleton pattern for global state management and memory efficiency
 */
export class UptimeService {
    private static instance: UptimeService;
    private eventEmitter: EventEmitter;
    private apiUrl: string;
    private fetchInterval: number;
    private intervalId: number | null = null;
    // Cache for resilience during network failures
    private lastSuccessfulData: FormattedUptimeData | null = null;

    private constructor() {
        this.eventEmitter = EventEmitter.getInstance();
        this.apiUrl = ApiConfig.uptimeUrl;
        this.fetchInterval = ApiConfig.fetchInterval;
    }

    /**
     * Returns the single instance of UptimeService
     * Lazily initializes the instance on first call
     */
    public static getInstance(): UptimeService {
        if (!UptimeService.instance) {
            UptimeService.instance = new UptimeService();
        }
        return UptimeService.instance;
    }

    /**
     * Initiates data polling from API
     * Sets up immediate and interval-based fetching
     */
    public startFetching(): void {
        console.log('Starting to fetch API data from', this.apiUrl);
        
        // Initial fetch to avoid delay
        this.fetchData();
        
        // Periodic updates
        this.intervalId = window.setInterval(async () => {
            await this.fetchData();
        }, this.fetchInterval);
    }

    /**
     * Terminates API polling and cleans up resources
     */
    public stopFetching(): void {
        console.log('Stopping API data fetch');
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    /**
     * Fetches and processes uptime data from the API
     * Implements error handling and validation of response format
     */
    private async fetchData(): Promise<void> {
        console.log('Fetching API data from', this.apiUrl);
        
        try {
            const response = await fetch(this.apiUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            let formattedData: FormattedUptimeData;
            
            if (data !== undefined) {
                formattedData = this.formatUptimeData(data);
                // Cache successful response for resilience
                this.lastSuccessfulData = formattedData;
                this.eventEmitter.emit(EventType.API_DATA_UPDATED, formattedData);
            } else {
                throw new Error("Unknown API response format");
            }
        } catch (error) {
            console.error('Error fetching API data:', error);
            this.eventEmitter.emit(EventType.API_ERROR, { 
                message: error instanceof Error ? error.message : 'Unknown error' 
            });
            
            // Circuit breaker pattern - fallback to alternative data source
            this.handleFallback();
        }
    }
    
    /**
     * Implements resilience strategies for API failures
     * Uses a multi-tiered approach prioritizing recent data over synthetic data
     */
    private handleFallback(): void {
        console.log('Using fallback mechanism');
        
        // Primary fallback: use cached data if available
        if (this.lastSuccessfulData) {
            console.log('Using last successful data');
            this.eventEmitter.emit(EventType.API_DATA_UPDATED, this.lastSuccessfulData);
            return;
        }
        
        // Secondary fallback: synthesize data from system time
        console.log('Generating mock uptime data');
        const mockUptimeSeconds = Math.floor(Date.now() / 1000) % (60 * 60 * 24 * 10);
        const formattedData = this.formatUptimeData(mockUptimeSeconds);
        
        this.eventEmitter.emit(EventType.API_DATA_UPDATED, formattedData);
    }

    /**
     * Converts raw uptime seconds into a structured time format
     * Handles integer division and modulo operations to extract time components
     */
    private formatUptimeData(uptimeSeconds: number): FormattedUptimeData {
        const seconds = Math.floor(uptimeSeconds % 60);
        const minutes = Math.floor((uptimeSeconds / 60) % 60);
        const hours = Math.floor((uptimeSeconds / (60 * 60)) % 24);
        const days = Math.floor(uptimeSeconds / (60 * 60 * 24));
        
        return { days, hours, minutes, seconds };
    }
} 