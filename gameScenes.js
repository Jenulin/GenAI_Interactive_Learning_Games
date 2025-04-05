import Phaser from 'phaser';

export class HomeScene extends Phaser.Scene {
    constructor() {
        super('HomeScene');
    }

    preload() {
        this.load.image('space_bg', 'space_background.jpeg');
        console.log('HomeScene: Preloading space_bg');
    }

    create() {
        const { width, height } = this.scale;
        const bg = this.add.image(width / 2, height / 2, 'space_bg')
            .setTint(0xaaaaaa)
            .setAlpha(0.9);
        let scale = Math.max(width / bg.width, height / bg.height);
        bg.setScale(scale);
        console.log('HomeScene: Background created');
    }
}

export class StoryScene extends Phaser.Scene {
    constructor() {
        super('StoryScene');
        this.topic = 'newton_laws';
    }

    preload() {
        this.load.image('stars_bg', 'space_background1.jpeg');
        
        console.log('StoryScene: Preloading stars_bg and astronaut');
    }

    init(data) {
        this.topic = data.topic || 'newton_laws';
        console.log(`StoryScene: Init with topic ${this.topic}`);
    }

    create() {
        const { width, height } = this.scale;
        this.add.image(width / 2, height / 2, 'stars_bg').setAlpha(0.9);
        console.log('StoryScene: Background created');
    }
}

export class PuzzleScene extends Phaser.Scene {
    constructor() {
        super('PuzzleScene');
        this.topic = 'newton_laws';
    }

    preload() {
        this.load.image('puzzle_bg', 'space_background3.jpeg');
        console.log('PuzzleScene: Preloading puzzle_bg');
    }

    init(data) {
        this.difficulty = data.difficulty || 'easy';
        this.topic = data.topic || 'newton_laws';
        console.log(`PuzzleScene: Init with topic ${this.topic}, difficulty ${this.difficulty}`);
    }

    create() {
        const { width, height } = this.scale;
        this.add.image(width / 2, height / 2, 'puzzle_bg').setAlpha(0.9);
        console.log('PuzzleScene: Background created');
    }
}