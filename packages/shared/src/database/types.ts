export interface ReputationUser {
    username: string;
    reputation: number;
}

export interface PointsUser {
    username: string;
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