import moment from "moment";
import { v4 as uuidv4 } from "uuid";
import { ICurrency } from "./currency";
import { ILabelsForm, getLabelsForm, cleanLabelsForm, ILabels } from "./label";

export interface ITransactionRow extends ILabels {
  uuid: string;
  createdAt: number;
  editedAt: number;
  processedAt: number;
  amount: number;
  currency: ICurrency;
  currencyVs: ICurrency;
}

export interface ITransactionRowForm extends ILabelsForm {
  readonly uuid: string;
  processedAt: Date;
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
): ITransactionRowForm {
  const [labelTitles, labelTexts] = getLabelsForm(
    projectLabelTitles,
    transactionRow,
  );
  return {
    uuid: transactionRowUuid || transactionRow?.uuid || uuidv4(),
    processedAt: new Date(transactionRow?.processedAt || Date.now()),
    amount: "",
    amountVs: "",
    currencyTicker: "",
    currencyTickerVs: "",
    rate: "",
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
    processedAt: moment(formData.processedAt).unix() * 1000,
    amount: 0,
    currency: { ticker: formData.currencyTicker },
    currencyVs: { ticker: formData.currencyTickerVs },
    labels: cleanLabelsForm(formData.labelTitles, formData.labelTexts),
  };
}
