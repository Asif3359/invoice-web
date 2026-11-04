import { businessApi } from "@/lib/business-api";

export interface BusinessOverview {
  invoices: number;
  products: number;
  expenses: number;
  payments: number;
  stockItems: number;
}

export async function fetchBusinessOverview(): Promise<BusinessOverview> {
  const { data } = await businessApi.get("/dashboard/summary");
  const summary = data?.data ?? {};

  return {
    invoices: Number(summary.invoices ?? 0),
    products: Number(summary.products ?? 0),
    expenses: Number(summary.expenses ?? 0),
    payments: Number(summary.payments ?? 0),
    stockItems: Number(summary.stockItems ?? 0),
  };
}
