import { Buffer } from "buffer";
import { Address } from "@emurgo/cardano-serialization-lib-asmjs";
import { getErrorMessage } from "@/lib/utils/errorMessage";
import {
  WalletConnectionError,
  DataSignFailed,
  UnavailableWallet,
} from "./errors";
import {
  ICardanoWallet,
  ICardanoWalletAPI,
  ISignDataResult,
  IWindowCardano,
} from "./types";

export class Wallet {
  private _api: ICardanoWalletAPI | null = null;

  constructor(public name: string) {}

  private get window(): IWindowCardano {
    return global.window as IWindowCardano;
  }

  private async getApi(): Promise<ICardanoWalletAPI> {
    if (this._api === null) {
      try {
        this._api = await this.wallet.enable();
      } catch (error) {
        throw new WalletConnectionError(getErrorMessage(error), this.name);
      }
    }
    return this._api;
  }

  get wallet(): ICardanoWallet {
    if (!this.window.cardano || !this.window.cardano[this.name]) {
      throw new UnavailableWallet(this.name);
    }
    return this.window.cardano[this.name];
  }

  get icon(): string {
    return this.wallet.icon;
  }

  get apiVersion(): string {
    return this.wallet.apiVersion;
  }

  async getNetworkId(): Promise<number> {
    const api = await this.getApi();
    return await api.getNetworkId();
  }

  async getChangeAddress(): Promise<string> {
    const api = await this.getApi();
    const rawAddress = await api.getChangeAddress();
    return Address.from_bytes(Buffer.from(rawAddress, "hex")).to_bech32();
  }

  async getUsedAddresses(): Promise<string[]> {
    const api = await this.getApi();
    return await api.getUsedAddresses();
  }

  async signData(
    addressCbor: string,
    hexPayload: string,
  ): Promise<ISignDataResult> {
    const api = await this.getApi();
    try {
      return await api.signData(addressCbor, hexPayload);
    } catch (error) {
      throw new DataSignFailed(getErrorMessage(error));
    }
  }
}
