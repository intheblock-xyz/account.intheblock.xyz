import { v4 as uuidv4 } from "uuid";
import { ICurrencyRate } from "../app";
import { ILabelsForm, getLabelsForm, cleanLabelsForm, ILabels } from "./label";

export interface ITransactionRow extends ILabels {
  uuid: string;
  createdAt: number;
  editedAt: number;
  amount: number;
  currencyTicker: string;
  currencyTickerVs: string;
}

export interface ITransactionRowForm extends ILabelsForm {
  readonly uuid: string;
  amount: string;
  amountVs: string;
  currencyTicker: string;
  currencyTickerVs: string;
  rate: string;
}

export interface ITransactionRowFormSubmit {
  formData: ITransactionRowForm;
  transactionRow?: ITransactionRow;
}

export function getTransactionRowForm(
  projectLabelTitles: Set<string>,
  transactionRowUuid?: string,
  transactionRow?: ITransactionRow,
  rates?: ICurrencyRate[],
): ITransactionRowForm {
  const currencyTicker = transactionRow?.currencyTicker || "";
  const currencyTickerVs = transactionRow?.currencyTickerVs || "";
  const rate = rates
    ? rates
        .find(
          (rate) =>
            currencyTicker === rate.currencyTicker &&
            currencyTickerVs === rate.currencyTickerVs,
        )
        ?.value.toString() || ""
    : "";
  const amount = transactionRow?.amount.toString() || "";
  const amountVs = rate
    ? (parseFloat(rate) * parseFloat(amount)).toString()
    : "";
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
    currencyTicker: formData.currencyTicker,
    currencyTickerVs: formData.currencyTickerVs,
    labels: cleanLabelsForm(formData.labelTitles, formData.labelTexts),
  };
}
