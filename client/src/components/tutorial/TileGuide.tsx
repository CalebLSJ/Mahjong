import React from 'react';
import TileComponent from '../ui/Tile';
import { Tile } from '@mahjong/shared';

function makeTile(id: string, kind: string, extra: Record<string, unknown> = {}): Tile {
  return { id, kind, ...extra } as unknown as Tile;
}

const SECTIONS = [
  {
    title: 'Suit Tiles (108 tiles)',
    description: 'Three suits, values 1–9, four copies each. The core of the game.',
    tiles: [
      { tile: makeTile('b1', 'suit', { suit: 'bamboo', value: 1 }), label: '1 Bamboo (竹)' },
      { tile: makeTile('b5', 'suit', { suit: 'bamboo', value: 5 }), label: '5 Bamboo' },
      { tile: makeTile('c1', 'suit', { suit: 'circles', value: 1 }), label: '1 Circle (餅)' },
      { tile: makeTile('c5', 'suit', { suit: 'circles', value: 5 }), label: '5 Circle' },
      { tile: makeTile('m1', 'suit', { suit: 'characters', value: 1 }), label: '1 Character (萬)' },
      { tile: makeTile('m5', 'suit', { suit: 'characters', value: 5 }), label: '5 Character' },
    ]
  },
  {
    title: 'Wind Tiles (16 tiles)',
    description: 'Four directions, four copies each. East is the seat of honour.',
    tiles: [
      { tile: makeTile('we', 'wind', { wind: 'east' }), label: 'East (東)' },
      { tile: makeTile('ws', 'wind', { wind: 'south' }), label: 'South (南)' },
      { tile: makeTile('ww', 'wind', { wind: 'west' }), label: 'West (西)' },
      { tile: makeTile('wn', 'wind', { wind: 'north' }), label: 'North (北)' },
    ]
  },
  {
    title: 'Dragon Tiles (12 tiles)',
    description: 'Three dragons, four copies each. Always worth tai to pong.',
    tiles: [
      { tile: makeTile('dr', 'dragon', { dragon: 'red' }), label: 'Red Dragon (中)' },
      { tile: makeTile('dg', 'dragon', { dragon: 'green' }), label: 'Green Dragon (发)' },
      { tile: makeTile('dw', 'dragon', { dragon: 'white' }), label: 'White Dragon (白)' },
    ]
  },
  {
    title: 'Flower & Season Tiles (8 tiles, SG mode)',
    description: 'Seat-matched bonus tiles. Draw one → reveal and draw replacement. Matching seat = +1 tai.',
    tiles: [
      { tile: makeTile('f1', 'flower', { flower: 'plum', seatNumber: 1 }), label: 'Plum (梅)' },
      { tile: makeTile('f2', 'flower', { flower: 'orchid', seatNumber: 2 }), label: 'Orchid (蘭)' },
      { tile: makeTile('f3', 'flower', { flower: 'chrysanthemum', seatNumber: 3 }), label: 'Chrysanthemum (菊)' },
      { tile: makeTile('f4', 'flower', { flower: 'bamboo-flower', seatNumber: 4 }), label: 'Bamboo (竹)' },
      { tile: makeTile('s1', 'season', { season: 'spring', seatNumber: 1 }), label: 'Spring (春)' },
      { tile: makeTile('s2', 'season', { season: 'summer', seatNumber: 2 }), label: 'Summer (夏)' },
      { tile: makeTile('s3', 'season', { season: 'autumn', seatNumber: 3 }), label: 'Autumn (秋)' },
      { tile: makeTile('s4', 'season', { season: 'winter', seatNumber: 4 }), label: 'Winter (冬)' },
    ]
  },
  {
    title: 'Animal Tiles (4 tiles, SG mode)',
    description: 'Bonus tiles like flowers. Rat+Cat = Yao. Chicken+Worm = Yao.',
    tiles: [
      { tile: makeTile('ar', 'animal', { animal: 'rat' }), label: 'Rat 🐭' },
      { tile: makeTile('ac', 'animal', { animal: 'cat' }), label: 'Cat 🐱' },
      { tile: makeTile('ach', 'animal', { animal: 'chicken' }), label: 'Chicken 🐔' },
      { tile: makeTile('aw', 'animal', { animal: 'worm' }), label: 'Worm 🐛' },
    ]
  },
];

export default function TileGuide() {
  return (
    <div className="space-y-8">
      {SECTIONS.map(section => (
        <div key={section.title}>
          <h3 className="text-lg font-bold text-[#ffd700] mb-1">{section.title}</h3>
          <p className="text-[#f5e6c8]/60 text-sm mb-3">{section.description}</p>
          <div className="flex flex-wrap gap-4">
            {section.tiles.map(({ tile, label }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <TileComponent tile={tile} size="lg" />
                <span className="text-xs text-[#f5e6c8]/50 text-center max-w-16">{label}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
