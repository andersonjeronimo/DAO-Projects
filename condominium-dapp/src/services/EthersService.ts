import { ethers } from "ethers";
import ABI from './ABI.json';
import { Profile, LoginResult, Resident, StorageKeys, ResidentPage, Topic, TopicPage } from "../utils/Lib";
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

export function isManager(): boolean {
    const profile = parseInt(localStorage.getItem(StorageKeys.PROFILE) || "0");
    return profile === Profile.MANAGER;
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

/**
 * TOPICS
 */

export async function getTopic(title: string): Promise<Topic> {
    const contract = getContract();
    const topic = await contract.getTopic(title);
    /* return {
        title: topic.title,
        description: topic.description,
        category: topic.category,
        amount: topic.amount || 0,
        accountable: topic.accountable,
        status: topic.status || undefined,
        createdDate: topic.createdDate,
        startDate: topic.startDate || undefined,
        endDate: topic.endDate || undefined,
    } as Topic; */
    return topic as Topic;
}

export async function getTopics(page: number, pageSize: number = 10): Promise<TopicPage> {
    const contract = getContract();
    const result = await contract.getTopics(page, pageSize) as TopicPage;
    const topics = result.topics.filter(t => t.createdDate);
    return {
        topics,
        total: result.total
    } as TopicPage;
}

export async function removeTopic(title: string): Promise<ethers.Transaction> {
    if (getProfile() !== Profile.MANAGER) {
        throw new Error(`You do not have permission`);
    }
    const contract = await getContractSigner();
    return await contract.removeTopic(title) as ethers.Transaction;
}

export async function addTopic(topic: Topic): Promise<ethers.Transaction> {
    const contract = await getContractSigner();
    topic.amount = ethers.toBigInt(topic.amount || 0);
    return await contract.addTopic(topic.title, topic.description, topic.category, topic.amount, topic.accountable) as ethers.Transaction;
}

export async function editTopic(topicToEdit: string, description: string, amount: ethers.BigNumberish, accountable: string): Promise<ethers.Transaction> {
    if (getProfile() !== Profile.MANAGER) {
        throw new Error(`You do not have permission`);
    }
    amount = ethers.toBigInt(amount || 0);
    const contract = await getContractSigner();
    return await contract.editTopic(topicToEdit, description, amount, accountable) as ethers.Transaction;
}