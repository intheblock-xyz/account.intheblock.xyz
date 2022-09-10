export interface ICurrency {
  name?: string;
  ticker: string;
  geckoId?: string;
  geckoVsId?: string;
  precision?: number;
}

export interface ICurrencyRate {
  currencyTicker: string;
  currencyTickerVs: string;
  value: number;
}
