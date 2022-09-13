import { v4 as uuidv4 } from "uuid";
import { ILabelsForm, getLabelsForm, cleanLabelsForm, ILabels } from "./label";
import { TTransactionFormRates } from "./transaction";

export interface ITransactionRow extends ILabels {
  uuid: string;
  createdAt: number;
  editedAt: number;
  amount: number;
  amountVs: number;
  currencyTicker: string;
  currencyTickerVs: string;
  lastTouched: "amount" | "exchange";
}

export interface ITransactionRowForm extends ILabelsForm {
  readonly uuid: string;
  amount: string;
  amountVs: string;
  currencyTicker: string;
  currencyTickerVs: string;
  rate: string;
  lastTouched: "amount" | "exchange";
  formErrors: Record<string, string>;
  submitAttempts: number;
}

export interface ITransactionRowFormSubmit {
  formData: ITransactionRowForm;
  transactionRow?: ITransactionRow;
}

export function getTransactionRowForm(
  projectLabelTitles: Set<string>,
  transactionRowUuid?: string,
  transactionRow?: ITransactionRow,
  rates?: TTransactionFormRates,
): ITransactionRowForm {
  let rate = "";
  const currencyTicker = transactionRow?.currencyTicker || "";
  const currencyTickerVs = transactionRow?.currencyTickerVs || "";
  if (transactionRow && rates) {
    rate = rates[`${currencyTicker}:${currencyTickerVs}`].toString() || "";
  }
  const amount = transactionRow?.amount.toString() || "";
  const amountVs = transactionRow?.amountVs.toString() || "";
  const [labelTitles, labelTexts] = getLabelsForm(
    projectLabelTitles,
    transactionRow,
  );
  return {
    uuid: transactionRowUuid || transactionRow?.uuid || uuidv4(),
    amount,
    amountVs,
    currencyTicker,
    currencyTickerVs,
    rate,
    labelTitles,
    labelTexts,
    lastTouched: transactionRow?.lastTouched || "amount",
    formErrors: {},
    submitAttempts: 0,
  };
}

export function cleanTransactionRowFormValues(
  formData: ITransactionRowForm,
  transactionRow?: ITransactionRow,
): ITransactionRow {
  const now = Date.now();
  return {
    uuid: formData.uuid,
    createdAt: transactionRow?.createdAt || now,
    editedAt: now,
    amount: parseFloat(formData.amount),
    amountVs: parseFloat(formData.amountVs),
    currencyTicker: formData.currencyTicker,
    currencyTickerVs: formData.currencyTickerVs,
    labels: cleanLabelsForm(formData.labelTitles, formData.labelTexts),
    lastTouched: formData.lastTouched,
  };
}
