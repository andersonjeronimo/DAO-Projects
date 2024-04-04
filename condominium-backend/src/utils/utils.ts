export type LoginData = {
    timestamp: number;
    wallet: string;
    secret: string;
}

export enum Profile {
    RESIDENT = 0,
    COUNSELOR = 1,
    MANAGER = 2
}