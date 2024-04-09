import { ethers } from "ethers";
import ABI from './ABI.json';
import { Profile, LoginResult, Resident, StorageKeys } from "../utils/Utils";
import { doApiLogin } from "./APIService";

const ADAPTER_ADDRESS = `${process.env.REACT_APP_ADAPTER_ADDRESS}`;

function getProfile(): Profile {
    const profile = localStorage.getItem(StorageKeys.PROFILE) || "0";
    return parseInt(profile);
}

export function isManagerOrCounselor(): boolean {
    const profile = parseInt(localStorage.getItem(StorageKeys.PROFILE) || "0");
    return profile === Profile.MANAGER || profile === Profile.COUNSELOR;
}

export function isAddressValid(address: string): boolean {
    return ethers.isAddress(address);
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
    const signer = await provider.getSigner(localStorage.getItem(StorageKeys.ACCOUNT) || undefined);
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
    let isManager = resident.isManager;

    if (!isManager && resident.residence > 0) {
        if (resident.isCounselor) {
            localStorage.setItem(StorageKeys.PROFILE, `${Profile.COUNSELOR}`);
        } else {
            localStorage.setItem(StorageKeys.PROFILE, `${Profile.RESIDENT}`);
        }
    } else if (!isManager && !resident.residence) {
        const manager = (await contract.getManager()) as string;
        isManager = manager.toUpperCase() === accounts[0].toUpperCase();
    }

    if (isManager) {
        localStorage.setItem(StorageKeys.PROFILE, `${Profile.MANAGER}`);
    } else if (localStorage.getItem(StorageKeys.PROFILE) === null) {
        localStorage.setItem(StorageKeys.PROFILE, `${Profile.UNAUTHORIZED}`);
    }

    localStorage.setItem(StorageKeys.ACCOUNT, accounts[0]);

    /**
     * Criar secret para geração de token (autenticação híbrida)
     */
    const signer = await provider.getSigner();
    const timestamp = Date.now();
    const message = `Authenticating... Timestamp: ${timestamp}`;
    const secret = await signer.signMessage(message);
    /**
     * Enviar secret para backend e receber o token gerado
     */
    const token = await doApiLogin(accounts[0], secret, timestamp);
    localStorage.setItem(StorageKeys.TOKEN, token);

    return {
        account: accounts[0],
        profile: parseInt(localStorage.getItem(StorageKeys.PROFILE) || "0"),
        token: token
    } as LoginResult;
}

export function doLogout() {
    localStorage.removeItem(StorageKeys.ACCOUNT);
    localStorage.removeItem(StorageKeys.PROFILE);
    localStorage.removeItem(StorageKeys.TOKEN);
}

export async function getAddress(): Promise<string> {
    const contract = getContract();
    return contract.getImplementationAddress();//getAddress();
}

export type ResidentPage = {
    residents: Resident[];
    total: ethers.BigNumberish;
}

export async function getResidents(page: number, pageSize: number = 10): Promise<ResidentPage> {
    const contract = getContract();
    const result = await contract.getResidents(page, pageSize) as ResidentPage;
    const residents = result.residents.filter(r => r.residence > 0);/* .sort((a, b) => {
        if (a.residence > b.residence) return 1;
        return -1;
    }) */
    return {
        residents,
        total: result.total
    } as ResidentPage;
}

/**wallet: string,
    isCounselor: boolean,
    isManager: boolean,
    residence: number,
    nextPayment: number */

export async function getResident(wallet: string): Promise<Resident> {
    const contract = getContract();
    const resident = await contract.getResident(wallet);
    return {
        wallet: resident.wallet || "",
        isCounselor: resident.isCounselor || false,
        isManager: resident.isManager || false,
        residence: ethers.toNumber(ethers.toBigInt(resident.residence)),
        nextPayment: resident.nextPayment
    } as Resident;
}

export async function upgrade(address: string): Promise<ethers.Transaction> {
    if (getProfile() !== Profile.MANAGER) {
        throw new Error(`You do not have permission`);
    }
    const contract = await getContractSigner();
    return await contract.upgrade(address) as ethers.Transaction;
}

export async function addResident(wallet: string, residenceId: number): Promise<ethers.Transaction> {
    if (getProfile() === Profile.RESIDENT) {
        throw new Error(`You do not have permission`);
    }
    const contract = await getContractSigner();
    return await contract.addResident(wallet, residenceId) as ethers.Transaction;
}

export async function removeResident(wallet: string): Promise<ethers.Transaction> {
    if (getProfile() !== Profile.MANAGER) {
        throw new Error(`You do not have permission`);
    }
    const contract = await getContractSigner();
    return await contract.removeResident(wallet) as ethers.Transaction;
}

export async function setCounselor(wallet: string, isEntering: boolean): Promise<ethers.Transaction> {
    if (getProfile() !== Profile.MANAGER) {
        throw new Error(`You do not have permission`);
    }
    const contract = await getContractSigner();
    return await contract.setCounselor(wallet, isEntering) as ethers.Transaction;
}

//Retorno do getResidents
/* tuple :  0xAd886e0aeCEbe71C1DA549FccCa811BB2662d91b,1101,false,false,0,
         0x7C3609F8f734b92084a82E5982CcC5197A4fC63C,1102,false,true,0,
         0x0000000000000000000000000000000000000000,0,false,false,0,
         0x0000000000000000000000000000000000000000,0,false,false,0,
         0x0000000000000000000000000000000000000000,0,false,false,0,
         0x0000000000000000000000000000000000000000,0,false,false,0,
         0x0000000000000000000000000000000000000000,0,false,false,0,
         0x0000000000000000000000000000000000000000,0,false,false,0,
         0x0000000000000000000000000000000000000000,0,false,false,0,
         0x0000000000000000000000000000000000000000,0,false,false,0,
         2 */