
export interface Prize {
  id: number;
  name: string;
  description: string;
  image: string;
  ticketUrl: string;
}

export interface UserState {
  isLoggedIn: boolean;
  hasSeenIntro: boolean;
  startDate: string | null; 
  lastSpinDate: string | null;
  collectedPrizes: number[]; 
  collectedReasons: number[]; 
  spinHistory: string[]; 
  scheduledDates: Record<number, string>;
  voiceRecordings: Record<number, string>;
  notificationsEnabled: boolean;
}

export enum GameView {
  GATEWAY = 'GATEWAY',
  LOGIN = 'LOGIN',
  INTRO = 'INTRO',
  WHEEL = 'WHEEL',
  COLLECTION = 'COLLECTION',
  WIN_SCREEN = 'WIN_SCREEN',
  VOICE_ECHO = 'VOICE_ECHO',
  RECORDING_STUDIO = 'RECORDING_STUDIO'
}
