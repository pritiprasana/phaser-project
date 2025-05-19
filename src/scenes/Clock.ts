import Phaser from "phaser";
import { EventEmitter, EventType } from "../events/EventEmitter";
import { UptimeService } from "../services/UptimeService";
import { FormattedUptimeData } from "../models/UptimeData";

/**
 * Clock scene that shows the uptime clock
 */
export default class ClockScene extends Phaser.Scene {
  private eventEmitter: EventEmitter;
  private uptimeService: UptimeService;

  // UI elements
  private daysText!: Phaser.GameObjects.Text;
  private timeText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;

  // Data state
  private currentData: FormattedUptimeData = {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  };

  constructor() {
    super({ key: "ClockScene" });
    this.eventEmitter = EventEmitter.getInstance();
    this.uptimeService = UptimeService.getInstance();
  }

  /**
   * Set up the scene when it starts
   */
  create(): void {
    console.log("Clock scene started");

    this.createClockUI();

    // Listen for events
    this.eventEmitter.on(
      EventType.API_DATA_UPDATED,
      this.handleDataUpdate.bind(this)
    );
    this.eventEmitter.on(EventType.API_ERROR, this.handleApiError.bind(this));

    // Start getting data
    this.uptimeService.startFetching();

    this.statusText.setText("Connecting to API...");
  }

  /**
   * Clean up when scene ends
   */
  shutdown(): void {
    console.log("Clock scene shutdown");
    this.eventEmitter.off(
      EventType.API_DATA_UPDATED,
      this.handleDataUpdate.bind(this)
    );
    this.eventEmitter.off(EventType.API_ERROR, this.handleApiError.bind(this));
    this.uptimeService.stopFetching();
  }

  /**
   * Create all visual elements
   */
  private createClockUI(): void {
    // Background
    const bg = this.add.rectangle(
      0,
      0,
      this.cameras.main.width,
      this.cameras.main.height,
      0x001a33
    );
    bg.setOrigin(0);

    // Days counter (top-left)
    this.daysText = this.add.text(20, 20, "", {
      fontFamily: "Orbitron, sans-serif",
      fontSize: "40px",
      color: "#4fc3f7",
    });
    this.daysText.setOrigin(0, 0);

    // Time display (bottom-right)
    this.timeText = this.add.text(
      this.cameras.main.width - 20,
      this.cameras.main.height - 20,
      "",
      {
        fontFamily: "Orbitron, sans-serif",
        fontSize: "60px",
        color: "#4fc3f7",
      }
    );
    this.timeText.setOrigin(1, 1);

    // Status message
    this.statusText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height - 50,
      "Initializing...",
      {
        fontFamily: "Arial",
        fontSize: "30px",
        color: "#ffffff",
      }
    );
    this.statusText.setOrigin(0.5);

    // Circle in middle
    const centerCircle = this.add.circle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      120,
      0x002a55
    );

    // Pulsing animation
    this.tweens.add({
      targets: centerCircle,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  /**
   * Handle new data from API
   */
  private handleDataUpdate(data: FormattedUptimeData): void {
    console.log("Received API data update", data);

    // Hide error messages
    this.statusText.setVisible(false);

    this.currentData = data;
    this.updateClockUI();
  }

  /**
   * Handle API errors
   */
  private handleApiError(error: { message: string }): void {
    console.error("API error:", error.message);
    this.statusText.setText(`Error: ${error.message}`);
    this.statusText.setVisible(true);
  }

  /**
   * Update the clock display
   */
  private updateClockUI(): void {
    const { days, hours, minutes, seconds } = this.currentData;

    // Update days text
    this.daysText.setText(`Days: ${days}`);

    // Format time with leading zeros
    const formattedHours = hours.toString().padStart(2, "0");
    const formattedMinutes = minutes.toString().padStart(2, "0");
    const formattedSeconds = seconds.toString().padStart(2, "0");

    const timeString = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    this.timeText.setText(timeString);

    // Flash effect when updated
    this.tweens.add({
      targets: this.timeText,
      alpha: 0.5,
      duration: 250,
      yoyo: true,
      ease: "Sine.easeInOut",
    });
  }
}
