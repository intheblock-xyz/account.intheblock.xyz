import moment from "moment";
import { v4 as uuidv4 } from "uuid";
import { ICurrencyRate } from "../app";
import {
  ITransactionRow,
  ITransactionRowForm,
  cleanTransactionRowFormValues,
} from "./row";

export type TTransactionDirection = "pay" | "receive";

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
  };
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
    ? rowsFormData.reduce(
        (rates, { currencyTicker, currencyTickerVs, rate }) => {
          const value = parseFloat(rate);
          if (!value) {
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
      )
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
