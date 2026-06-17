export type Suit = 'bamboo' | 'circles' | 'characters';
export type WindDir = 'east' | 'south' | 'west' | 'north';
export type DragonColor = 'red' | 'green' | 'white';
export type FlowerName = 'plum' | 'orchid' | 'chrysanthemum' | 'bamboo-flower';
export type SeasonName = 'spring' | 'summer' | 'autumn' | 'winter';
export type AnimalName = 'rat' | 'chicken' | 'worm' | 'cat';

export type TileKind =
  | { kind: 'suit'; suit: Suit; value: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 }
  | { kind: 'wind'; wind: WindDir }
  | { kind: 'dragon'; dragon: DragonColor }
  | { kind: 'flower'; flower: FlowerName; seatNumber: 1 | 2 | 3 | 4 }
  | { kind: 'season'; season: SeasonName; seatNumber: 1 | 2 | 3 | 4 }
  | { kind: 'animal'; animal: AnimalName }
  | { kind: 'fei' };

export type Tile = { id: string } & TileKind;

export type MeldType = 'pong' | 'kong' | 'chow' | 'concealed-kong';
export type Meld = {
  type: MeldType;
  tiles: Tile[];
  claimedFromSeat?: number;
};

export type GamePhase =
  | 'lobby'
  | 'dealing'
  | 'awaiting-discard'
  | 'claim-window'
  | 'awaiting-chow'
  | 'pending-bonus'
  | 'round-end'
  | 'game-over';

export type BotDifficulty = 'easy' | 'medium' | 'hard';

export type ClaimType = 'win' | 'pong' | 'kong' | 'chow' | 'pass';

export type HouseRules = {
  variant: 'sg' | 'hk';
  minTai: number;
  maxTai: number | null;
  allow7Pairs: boolean;
  allow13Orphans: boolean;
  allowFlowers: boolean;
  allowAnimals: boolean;
  yaoPayout: 'unit' | 'tai';
  feiEnabled: boolean;
  allowChow: boolean;
  lvYiSeRecognized: boolean;
  daSiXiStrictPair: boolean;
  daSanYuanStrictPair: boolean;
  dealerBonus: boolean;
  zimoBonus: boolean;
  unitValue: number;
  taiTable: Record<string, number>;
};

export type PlayerPublicInfo = {
  id: string;
  name: string;
  seat: number;
  wind: WindDir;
  handSize: number;
  melds: Meld[];
  bonusTiles: Tile[];
  isDealer: boolean;
  isBot: boolean;
  score: number;
};

export type GameView = {
  roomCode: string;
  myPlayerId: string;
  mySeat: number;
  myHand: Tile[];
  myMelds: Meld[];
  myBonusTiles: Tile[];
  players: PlayerPublicInfo[];
  wallCount: number;
  currentSeat: number;
  phase: GamePhase;
  lastDiscard: Tile | null;
  lastDiscardSeat: number | null;
  claimWindowEndsAt: number | null;
  prevailingWind: WindDir;
  roundNumber: number;
  dealerSeat: number;
  houseRules: HouseRules;
  eligibleClaims: ClaimType[];
  pendingBonus: Tile | null;
  roundResult: RoundResult | null;
  discardHistory: Record<number, Tile[]>;
};

export type TaiComponent = {
  key: string;
  label: string;
  tai: number;
};

export type WinType = 'ron' | 'zimo';
export type RoundResult = {
  winnerId: string | null;
  winType: WinType | null;
  winnerSeat: number | null;
  discardSeat: number | null;
  taiComponents: TaiComponent[];
  totalTai: number;
  payouts: Record<string, number>;
  newScores: Record<string, number>;
};

export type LobbyPlayerInfo = {
  id: string;
  name: string;
  seat: number;
  isBot: boolean;
  botDifficulty?: BotDifficulty;
  isHost: boolean;
};

export interface ServerToClientEvents {
  'room:created': (data: { roomCode: string; playerId: string; seat: number }) => void;
  'room:joined': (data: { roomCode: string; playerId: string; seat: number; players: LobbyPlayerInfo[]; houseRules: HouseRules }) => void;
  'room:updated': (data: { players: LobbyPlayerInfo[]; houseRules: HouseRules }) => void;
  'room:error': (message: string) => void;
  'game:state': (view: GameView) => void;
  'game:bonus-revealed': (data: { seat: number; tile: Tile }) => void;
  error: (message: string) => void;
}

export interface ClientToServerEvents {
  'room:create': (data: { playerName: string; houseRules: HouseRules }) => void;
  'room:join': (data: { roomCode: string; playerName: string }) => void;
  'room:add-bot': (data: { difficulty: BotDifficulty; name: string }) => void;
  'room:remove-bot': (data: { seat: number }) => void;
  'room:update-rules': (rules: HouseRules) => void;
  'room:start': () => void;
  'game:discard': (data: { tileId: string }) => void;
  'game:claim': (data: { action: ClaimType; chowTileIds?: [string, string] }) => void;
  'game:concealed-kong': (data: { tileId: string }) => void;
  'game:bu-flower': () => void;
}
