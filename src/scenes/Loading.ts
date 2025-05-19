import Phaser from "phaser";
import { EventEmitter, EventType } from "../events/EventEmitter";

export default class LoadingScene extends Phaser.Scene {
  private eventEmitter: EventEmitter;
  private loadingText!: Phaser.GameObjects.Text;
  private progressBar!: Phaser.GameObjects.Graphics;
  private progressValue = 0;
  private progressSteps = 0;
  private totalSteps = 10;

  constructor() {
    super({ key: "LoadingScene" });
    this.eventEmitter = EventEmitter.getInstance();
  }

  preload(): void {
    this.createLoadingUI();
  }

  create(): void {
    const timer = this.time.addEvent({
      delay: 100,
      callback: this.updateProgress,
      callbackScope: this,
      repeat: this.totalSteps - 1, 
    });
  }

  private updateProgress(): void {
    this.progressSteps++;
    this.progressValue = this.progressSteps / this.totalSteps;

    // Update progress bar
    this.progressBar.clear();
    this.progressBar.fillStyle(0xffffff, 1);
    this.progressBar.fillRect(
      this.cameras.main.width / 4,
      this.cameras.main.height / 2 - 16,
      (this.cameras.main.width / 2) * this.progressValue,
      32
    );

    // Update text
    const percentage = Math.floor(this.progressValue * 100);
    this.loadingText.setText(`Loading: ${percentage}%`);

    // When complete, transition to main scene
    if (this.progressSteps >= this.totalSteps) {
      this.loadingText.setText(`Loading: 100%`);

      // Short delay before transitioning to ensure UI updates
      this.time.delayedCall(100, () => {
        this.eventEmitter.emit(EventType.ASSETS_LOADED, undefined);
        this.eventEmitter.emit(EventType.SCENE_CHANGE, { scene: "ClockScene" });
        this.scene.start("ClockScene");
      });
    }
  }

  private createLoadingUI(): void {
    const bgBar = this.add.graphics();
    bgBar.fillStyle(0x222222, 0.8);
    bgBar.fillRect(
      this.cameras.main.width / 4,
      this.cameras.main.height / 2 - 16,
      this.cameras.main.width / 2,
      32
    );

    this.progressBar = this.add.graphics();

    this.loadingText = this.add
      .text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2 - 50,
        "Loading: 0%",
        {
          font: "24px Arial",
          color: "#ffffff",
        }
      )
      .setOrigin(0.5);
  }
}
