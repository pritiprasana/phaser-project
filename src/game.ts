import Phaser from 'phaser';
import { GameConfig } from './config/GameConfig';

window.onload = () => {
    // Create the game
    const game = new Phaser.Game(GameConfig);
    
    // Handle window resize
    window.addEventListener('resize', () => {
        game.scale.refresh();
    });
    // @ts-ignore
    // This is to get the game instance in the global scope to use the pixi/phaser chrome extension

    globalThis.__PHASER_GAME__ = game;
}; 