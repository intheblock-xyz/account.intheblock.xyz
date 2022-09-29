import moment from "moment";
import { v4 as uuidv4 } from "uuid";
import { ICurrencyRate } from "../app";
import {
  ITransactionRow,
  ITransactionRowForm,
  cleanTransactionRowFormValues,
} from "./row";

export type TTransactionDirection = "pay" | "receive";
export type TTransactionFormRates = Record<string, number>;

export interface ITransaction {
  uuid: string;
  createdAt: number;
  editedAt: number;
  processedAt: number;
  direction: TTransactionDirection;
  rows: ITransactionRow[];
  rates: ICurrencyRate[];
}

export interface ITransactionForm {
  readonly uuid: string;
  processedAt: Date;
  rowUuids: string[];
  rates: TTransactionFormRates;
}

export interface ITransactionFormSubmit {
  formData: ITransactionForm;
  transaction: ITransaction;
}

export function getTransactionForm(
  transaction?: ITransaction,
): ITransactionForm {
  return {
    uuid: transaction?.uuid || uuidv4(),
    processedAt: new Date(transaction?.processedAt || Date.now()),
    rowUuids: transaction?.rows.map(({ uuid }) => uuid) || [],
    rates: getTransactionFormRates(transaction?.rates || []),
  };
}

function getTransactionFormRates(
  rates: ICurrencyRate[],
): TTransactionFormRates {
  return Object.fromEntries(
    rates.map(({ currencyTicker, currencyTickerVs, value }) => [
      `${currencyTicker}:${currencyTickerVs}`,
      value,
    ]),
  );
}

function getRatesFromRowsFormData(
  rowsFormData: ITransactionRowForm[],
): ICurrencyRate[] {
  return rowsFormData.reduce(
    (rates, { currencyTicker, currencyTickerVs, rate }) => {
      const value = parseFloat(rate);
      if (isNaN(value) || value < 0) {
        throw new Error("Rate missed");
      }
      if (
        !rates.find(
          (rate) =>
            rate.currencyTicker === currencyTicker &&
            rate.currencyTickerVs === currencyTickerVs,
        )
      ) {
        rates.push({
          currencyTicker,
          currencyTickerVs,
          value,
        });
      }
      return rates;
    },
    [] as ICurrencyRate[],
  );
}

export function cleanTransactionFormValues(
  formData: ITransactionForm,
  rowsFormData?: ITransactionRowForm[],
  transaction?: ITransaction,
  transactionDirection?: TTransactionDirection,
): ITransaction {
  if (!transaction?.direction && !transactionDirection) {
    throw new Error("Transaction direction missed");
  }
  const now = Date.now();
  const rows = rowsFormData
    ? rowsFormData.map((rowFormData) =>
        cleanTransactionRowFormValues(
          rowFormData,
          transaction?.rows
            ? transaction?.rows.find(({ uuid }) => uuid === rowFormData.uuid)
            : undefined,
        ),
      )
    : transaction?.rows || [];
  const rates = rowsFormData
    ? getRatesFromRowsFormData(rowsFormData)
    : transaction?.rates || [];
  return {
    uuid: formData.uuid,
    createdAt: transaction?.createdAt || now,
    editedAt: now,
    processedAt: moment(formData.processedAt).unix() * 1000,
    direction: (transaction?.direction ||
      transactionDirection) as TTransactionDirection,
    rows,
    rates,
  };
}
