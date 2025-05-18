import { FormattedUptimeData } from '../models/UptimeData';

// Define all event types
export enum EventType {
    ASSETS_LOADED = 'assets_loaded',
    API_DATA_UPDATED = 'api_data_updated',
    API_ERROR = 'api_error',
    SCENE_CHANGE = 'scene_change'
}

// Define payload types for each event
export interface EventPayloads {
    [EventType.ASSETS_LOADED]: void;
    [EventType.API_DATA_UPDATED]: FormattedUptimeData;
    [EventType.API_ERROR]: { message: string };
    [EventType.SCENE_CHANGE]: { scene: string };
}

// Define event handler type
type EventHandler<T> = (data: T) => void;

// Event bus singleton class
export class EventEmitter {
    private static instance: EventEmitter;
    private listeners: { [key in EventType]?: Array<EventHandler<any>> } = {};

    private constructor() {}

    // Get singleton instance
    public static getInstance(): EventEmitter {
        if (!EventEmitter.instance) {
            EventEmitter.instance = new EventEmitter();
        }
        return EventEmitter.instance;
    }

    // Subscribe to an event
    public on<T extends EventType>(event: T, handler: EventHandler<EventPayloads[T]>): void {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event]?.push(handler);
    }

    // Unsubscribe from an event
    public off<T extends EventType>(event: T, handler: EventHandler<EventPayloads[T]>): void {
        if (!this.listeners[event]) {
            return;
        }
        
        const index = this.listeners[event]?.indexOf(handler) ?? -1;
        if (index !== -1) {
            this.listeners[event]?.splice(index, 1);
        }
    }

    // Emit an event
    public emit<T extends EventType>(event: T, data: EventPayloads[T]): void {
        if (!this.listeners[event]) {
            return;
        }
        
        this.listeners[event]?.forEach(handler => {
            handler(data);
        });
    }
} 