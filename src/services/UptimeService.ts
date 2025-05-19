import { EventEmitter, EventType } from "../events/EventEmitter";
import { UptimeData, FormattedUptimeData } from "../models/UptimeData";
import { ApiConfig } from "../config/GameConfig";

/**
 * Service responsible for fetching and managing uptime data from remote API
 * Implements singleton pattern
 */
export class UptimeService {
  private static instance: UptimeService;
  private eventEmitter: EventEmitter;
  private apiUrl: string;
  private fetchInterval: number;
  private intervalId: number | null = null;

  private constructor() {
    this.eventEmitter = EventEmitter.getInstance();
    this.apiUrl = ApiConfig.uptimeUrl;
    this.fetchInterval = ApiConfig.fetchInterval;
  }

  /**
   * Get or create the service instance
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
    console.log("Starting to fetch API data from", this.apiUrl);

    // Initial fetch to avoid delay
    this.fetchData();

    // Periodic updates
    this.intervalId = window.setInterval(async () => {
      await this.fetchData();
    }, this.fetchInterval);
  }

  /**
   * Stop fetching data and clean up interval
   */
  public stopFetching(): void {
    console.log("Stopping API data fetch");
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Fetches uptime data from remote API
   * Handles network errors and invalid JSON responses
   */
  private async fetchData(): Promise<void> {
    console.log("Fetching API data from", this.apiUrl);

    try {
      const response = await fetch(this.apiUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      let formattedData: FormattedUptimeData;

      if (data !== undefined) {
        formattedData = this.formatUptimeData(data);
        this.eventEmitter.emit(EventType.API_DATA_UPDATED, formattedData);
      } else {
        throw new Error("Unknown API response format");
      }
    } catch (error) {
      console.error("Error fetching API data:", error);
      this.eventEmitter.emit(EventType.API_ERROR, {
        message: error instanceof Error ? error.message : "Unknown error",
      });
      }
    }

  /**
   * Converts raw uptime data into formatted days, hours, minutes, and seconds
   */
  private formatUptimeData(uptimeSeconds: number): FormattedUptimeData {
    const seconds = Math.floor(uptimeSeconds % 60);
    const minutes = Math.floor((uptimeSeconds / 60) % 60);
    const hours = Math.floor((uptimeSeconds / (60 * 60)) % 24);
    const days = Math.floor(uptimeSeconds / (60 * 60 * 24));

    return { days, hours, minutes, seconds };
  }
}
