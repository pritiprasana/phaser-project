import Phaser from 'phaser';
import LoadingScene from '../scenes/Loading';
import ClockScene from '../scenes/Clock';


export const GameConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    parent: 'game-container',
    backgroundColor: '#1e2d3b',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [LoadingScene, ClockScene]
};

export const ApiConfig = {
    uptimeUrl: 'https://rng.dev.anymaplay.com/uptime',
    fetchInterval: 60000 // 1 minute
}; 