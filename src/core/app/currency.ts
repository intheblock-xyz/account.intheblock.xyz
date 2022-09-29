export interface ICurrency {
  name?: string;
  ticker: string;
  convertible: boolean;
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

export function getCurrencyIsConvertible(
  currencies: ICurrency[],
  ticker: string,
  dflt = true,
): boolean {
  const isConvertible = Array.from(currencies).find(
    (currency) => currency.ticker === ticker,
  )?.convertible;
  return isConvertible === false ? isConvertible : isConvertible || dflt;
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
  if (rate === undefined || rate < 0) {
    throw new Error("Rate missed");
  }
  return rate;
}
