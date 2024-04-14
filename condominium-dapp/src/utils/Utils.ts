import { ethers } from "ethers";

export enum Profile {
    RESIDENT = 0,
    COUNSELOR = 1,
    MANAGER = 2,
    UNAUTHORIZED = 3
}

export enum StorageKeys {
    ACCOUNT = "account",
    PROFILE = "profile",
    TOKEN = "token"
}

export type Resident = {
    wallet: string;
    isCounselor: boolean;
    isManager: boolean;
    residence: number;
    //nextPayment: number;
    nextPayment: ethers.BigNumberish;
}

export type ResidentPage = {
    residents: Resident[];
    total: ethers.BigNumberish;
}

export type ApiResident = {
    wallet: string;
    name: string;
    profile: Profile;
    phone?: string;
    email?: string;
}

export type LoginResult = {
    account: string;
    profile: Profile;
    token: string;
}

export type TopicPage = {
    topics: Topic[];
    total: ethers.BigNumberish;
}

export type Topic = {
    title: string;
    description: string;
    category: Category;
    //amount: number;
    amount: ethers.BigNumberish;
    //responsible: string;
    accountable: string;
    status?: Status;
    createdDate: ethers.BigNumberish;
    startDate?: ethers.BigNumberish;
    endDate?: ethers.BigNumberish;
}

export enum Status {
    IDLE = 0,
    VOTING = 1,
    APPROVED = 2,
    DENIED = 3,
    DELETED = 4,
    SPENT = 5
}

export enum Category {
    DECISION = 0,
    SPENT = 1,
    CHANGE_QUOTA = 2,
    CHANGE_MANAGER = 3
}

export enum CategoryStr {
    DECISION = "Decision",
    SPENT = "Spent",
    CHANGE_QUOTA = "Change Quota",
    CHANGE_MANAGER = "Change Manager"
}

export enum Options {
    EMPTY = 0,
    YES = 1,
    NO = 2,
    ABSTENTION = 3
}   

export type Vote = {
    resident: string;
    residence: number;
    option: Options;
    timestamp: ethers.BigNumberish;
}

/* struct TopicUpdate {
    bytes32 id;
    string title;
    Status status;
    Category category;
}

struct TransferReceipt {
    address to;
    uint amount;
    string topic;
} */