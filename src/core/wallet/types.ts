export interface IWindowCardano extends Window {
  cardano?: Record<string, ICardanoWallet>;
}

export interface ICardanoWallet {
  icon: string;
  name: string;
  apiVersion: string;
  isEnabled: () => Promise<boolean>;
  enable: () => Promise<ICardanoWalletAPI>;
}

export interface ICardanoWalletAPI {
  getNetworkId: () => Promise<number>;
  getChangeAddress: () => Promise<string>;
  getUsedAddresses: () => Promise<string[]>;
  signData: (addressCbor: string, payload: string) => Promise<ISignDataResult>;
}

export interface ISignDataResult {
  success: boolean;
  signedData: string;
}
