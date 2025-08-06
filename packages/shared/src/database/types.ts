import { LowercaseString } from "./points.manager";

export interface ReputationUser {
  username: LowercaseString;
  reputation: number;
}

export interface PointsUser {
  username: LowercaseString;
  displayName?: string;
  points: number;
  debt: number;
  lastBet: number;
  lastLoan: number;
  wins: number;
  losses: number;
  lastDuel: number;
  lastRobbery: number;
  robberies: number;
  successfulRobberies: number;
  betsCount?: number;
}
