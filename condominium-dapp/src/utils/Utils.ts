export enum Profile {
    RESIDENT = 0,
    COUNSELOR = 1,
    MANAGER = 2,
    UNAUTHORIZED = 3
}

export type Resident = {
    wallet: string,
    isCounselor: boolean,
    isManager: boolean,
    residence: number,
    nextPayment: number
}

export type ApiResident = {
    wallet: string;
    name: string;
    profile: Profile;
    phone?: string;
    email?: string;
}

export type LoginResult = {
    account: string,
    profile: Profile,
    token: string
}