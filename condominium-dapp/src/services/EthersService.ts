import { ethers } from "ethers";
import ABI from './ABI.json';

const ADAPTER_ADDRESS = `${process.env.REACT_APP_ADAPTER_ADDRESS}`;

export enum Profile {
    RESIDENT = 0,
    COUNSELOR = 1,
    MANAGER = 2
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

export async function doLogin(): Promise<LoginResult> {
    const provider = getProvider();
    const accounts = await provider.send("eth_requestAccounts", []);
    if (!accounts || !accounts.length) {
        throw new Error("Wallet not found | allowed");
    }

    const contract = getContract(provider);
    const manager = (await contract.getManager()) as string;
    const isManager = manager.toUpperCase() === accounts[0].toUpperCase();

    if (isManager) {
        localStorage.setItem("dao_profile", `${Profile.MANAGER}`);
        //localStorage.setItem(LocalStorageMap.get(LocalStorageItem.PROFILE)!, `${Profile.MANAGER}`);
    } else {
        localStorage.setItem("dao_profile", `${Profile.RESIDENT}`);
        //localStorage.setItem(LocalStorageMap.get(LocalStorageItem.PROFILE)!, `${Profile.RESIDENT}`);
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