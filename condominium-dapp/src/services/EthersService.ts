import { ethers } from "ethers";
import ABI from './ABI.json';

const ADAPTER_ADDRESS = `${process.env.REACT_APP_ADAPTER_ADDRESS}`;

export enum Profile {
    RESIDENT = 0,
    COUNSELOR = 1,
    MANAGER = 2,
    UNAUTHORIZED = 3
}

export type Resident = {
    wallet: string,
    isCouselor: boolean,
    isManager: boolean,
    residence: number,
    nextPayment: number
}

/* export enum LocalStorageItem {
    PROFILE = 0,
    ACCOUNT = 1
}
const LocalStorageMap = new Map<number, string>();
LocalStorageMap.set(LocalStorageItem.PROFILE, "DAOProfile");
LocalStorageMap.set(LocalStorageItem.ACCOUNT, "metamaskAccount");
export default LocalStorageMap; */

export type LoginResult = {
    account: string,
    profile: Profile
}

function getProfile():Profile {
    const profile = localStorage.getItem("dao_profile") || "0";
    return parseInt(profile);
}

function getProvider(): ethers.BrowserProvider {
    if (!window.ethereum) {
        throw new Error("No Metamask found");
    } else {
        return new ethers.BrowserProvider(window.ethereum);
    }
}

function getContract(provider?: ethers.BrowserProvider): ethers.Contract {
    if (!provider) {
        provider = getProvider();
    }
    return new ethers.Contract(ADAPTER_ADDRESS, ABI as ethers.InterfaceAbi, provider);
}

async function getContractSigner(provider?: ethers.BrowserProvider): Promise<ethers.Contract> {
    if (!provider) {
        provider = getProvider();
    }
    const signer = await provider.getSigner(localStorage.getItem("account") || undefined);
    const contract = new ethers.Contract(ADAPTER_ADDRESS, ABI as ethers.InterfaceAbi, provider);
    return contract.connect(signer) as ethers.Contract;
}

export async function doLogin(): Promise<LoginResult> {
    doLogout();
    const provider = getProvider();
    const accounts = await provider.send("eth_requestAccounts", []);
    if (!accounts || !accounts.length) {
        throw new Error("Wallet not found | allowed");
    }

    const contract = getContract(provider);
    const resident = (await contract.getResident(accounts[0])) as Resident;
    let isManager = false;


    if (resident.residence > 0) {
        if (resident.isCouselor)
            localStorage.setItem("dao_profile", `${Profile.COUNSELOR}`);
        else if (resident.isManager)
            localStorage.setItem("dao_profile", `${Profile.MANAGER}`);
        else localStorage.setItem("dao_profile", `${Profile.RESIDENT}`);
    } else {
        const manager = (await contract.getManager()) as string;
        isManager = manager.toUpperCase() === accounts[0].toUpperCase();
        if (isManager) {
            localStorage.setItem("dao_profile", `${Profile.MANAGER}`);
        } else {
            localStorage.setItem("dao_profile", `${Profile.UNAUTHORIZED}`);
            //throw new Error("Unauthorized");
        }
    }

    localStorage.setItem("metamask_account", accounts[0]);
    return {
        account: accounts[0],
        profile: parseInt(localStorage.getItem("dao_profile") || "0")
    } as LoginResult;
}

export function doLogout() {
    localStorage.removeItem("metamask_account");
    localStorage.removeItem("dao_profile");
}

export async function getAddress(): Promise<string> {
    const contract = getContract();
    return contract.getImplementationAddress();//getAddress();
}

export async function upgrade(address: string): Promise<ethers.Transaction> {
    if (getProfile() !== Profile.MANAGER) {
        throw new Error(`You do not have permission`);
    }
    const contract = await getContractSigner();
    return await contract.upgrade(address) as ethers.Transaction;
}