export enum Status {
  Success = 'Success',
  Failed = 'Failed',
  Incomplete = 'Incomplete',
}

export type HistoryCardProps = {
  amount: string; // misal "1.000 USD"
  date: string; // misal "Sep 25, 2023 4:40 PM"
  status: string;
  bank: string; // misal "Bank BCA"
  cardNumber: string; // misal "**** 0098"
  id: string;
};
