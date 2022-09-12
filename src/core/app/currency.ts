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

export function getCurrencyPrecision(
  currencies: ICurrency[],
  ticker: string,
  dflt = 2,
): number {
  const precision = Array.from(currencies).find(
    (currency) => currency.ticker === ticker,
  )?.precision;
  return typeof precision === "number" ? precision : dflt;
}

export function getCurrencyRate(
  rates: ICurrencyRate[],
  ticker: string,
  tickerVs: string,
): number {
  const rate = rates.find(
    (rate) =>
      rate.currencyTicker === ticker && rate.currencyTickerVs === tickerVs,
  )?.value;
  if (!rate) {
    throw new Error("Rate missed");
  }
  return rate;
}
