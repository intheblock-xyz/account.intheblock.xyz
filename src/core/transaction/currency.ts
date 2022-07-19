export interface ICurrency {
  name?: string;
  ticker: string;
  geckoId?: string;
  geckoVsId?: string;
}

export interface ICurrencyRate {
  currency: ICurrency;
  currencyVs: ICurrency;
  value: number;
}
