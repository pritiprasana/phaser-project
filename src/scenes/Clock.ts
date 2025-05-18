import Phaser from 'phaser';
import { EventEmitter, EventType } from '../events/EventEmitter';
import { UptimeService } from '../services/UptimeService';
import { FormattedUptimeData } from '../models/UptimeData';

/**
 * Main scene that displays the uptime clock
 * Handles visual rendering and updates based on API data events
 */
export default class ClockScene extends Phaser.Scene {
    private eventEmitter: EventEmitter;
    private uptimeService: UptimeService;
    
    // UI elements
    private daysText!: Phaser.GameObjects.Text;
    private timeText!: Phaser.GameObjects.Text;
    private statusText!: Phaser.GameObjects.Text;

    // State management
    private currentData: FormattedUptimeData = {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    };

    constructor() {
        super({ key: 'ClockScene' });
        this.eventEmitter = EventEmitter.getInstance();
        this.uptimeService = UptimeService.getInstance();
    }

    /**
     * Initializes the scene and establishes event subscriptions
     * Entry point for scene lifecycle after assets are loaded
     */
    create(): void {
        console.log('Clock scene started');
        
        this.createClockUI();
        
        // Register event handlers
        this.eventEmitter.on(EventType.API_DATA_UPDATED, this.handleDataUpdate.bind(this));
        this.eventEmitter.on(EventType.API_ERROR, this.handleApiError.bind(this));
        
        // Begin data acquisition cycle
        this.uptimeService.startFetching();
        
        this.statusText.setText('Connecting to API...');
    }

    /**
     * Performs cleanup when scene is terminated
     * Prevents memory leaks from lingering event listeners and intervals
     */
    shutdown(): void {
        console.log('Clock scene shutdown');
        this.eventEmitter.off(EventType.API_DATA_UPDATED, this.handleDataUpdate.bind(this));
        this.eventEmitter.off(EventType.API_ERROR, this.handleApiError.bind(this));
        this.uptimeService.stopFetching();
    }

    /**
     * Constructs the visual elements of the clock interface
     * Positions elements according to the design requirements
     */
    private createClockUI(): void {
        // Base layer
        const bg = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x001a33);
        bg.setOrigin(0);
        
        // Days counter - top-left positioning as specified in requirements
        this.daysText = this.add.text(
            20, 
            20, 
            '', 
            {
                fontFamily: 'Orbitron, sans-serif',
                fontSize: '40px',
                color: '#4fc3f7'
            }
        );
        this.daysText.setOrigin(0, 0);

        // Time display - bottom-right positioning as specified in requirements
        this.timeText = this.add.text(
            this.cameras.main.width - 20, 
            this.cameras.main.height - 20, 
            '', 
            {
                fontFamily: 'Orbitron, sans-serif',
                fontSize: '60px',
                color: '#4fc3f7'
            }
        );
        this.timeText.setOrigin(1, 1);
        
        // Status indicator for connection state and errors
        this.statusText = this.add.text(
            this.cameras.main.width / 2, 
            this.cameras.main.height / 2, 
            'Initializing...', 
            {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#ffffff'
            }
        );
        this.statusText.setOrigin(0.5);
        
        // Visual enhancements
        const centerCircle = this.add.circle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            120,
            0x002a55
        );
        
        // Breathing animation effect 
        this.tweens.add({
            targets: centerCircle,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    /**
     * Processes incoming API data and updates the UI
     * @param data Formatted uptime information from the service
     */
    private handleDataUpdate(data: FormattedUptimeData): void {
        console.log('Received API data update', data);
        
        // Hide error/status messages on successful data
        this.statusText.setVisible(false);
        
        this.currentData = data;
        this.updateClockUI();
    }

    /**
     * Handles API errors and displays appropriate user feedback
     * @param error Error information from failed API requests
     */
    private handleApiError(error: { message: string }): void {
        console.error('API error:', error.message);
        this.statusText.setText(`Error: ${error.message}`);
        this.statusText.setVisible(true);
    }

    /**
     * Updates the display with current time values
     * Includes formatting and transition effects
     */
    private updateClockUI(): void {
        const { days, hours, minutes, seconds } = this.currentData;
        
        // Days counter update
        this.daysText.setText(`Days: ${days}`);
        
        // Format time with leading zeros for consistent display
        const formattedHours = hours.toString().padStart(2, '0');
        const formattedMinutes = minutes.toString().padStart(2, '0');
        const formattedSeconds = seconds.toString().padStart(2, '0');
        
        const timeString = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
        this.timeText.setText(timeString);
        
        // Visual feedback for updates - subtle flash effect
        this.tweens.add({
            targets: this.timeText,
            alpha: 0.5,
            duration: 250,
            yoyo: true,
            ease: 'Sine.easeInOut'
        });
    }
} 