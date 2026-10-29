export interface OfficeExpense {
  id: string;
  vendor_name: string;
  category: string;
  invoice_no: string;
  invoice_date: string;
  base_amount: number;
  gst_rate: number;
  gst_amount: number;
  total_amount: number;
  status: "Paid" | "Pending";
}

export const defaultExpenses: OfficeExpense[] = [
  {
    id: "OE-1",
    vendor_name: "WeWork Cyber City",
    category: "Office Rent",
    invoice_no: "WW-2026-10-892",
    invoice_date: "2026-10-01",
    base_amount: 450000,
    gst_rate: 18,
    gst_amount: 81000,
    total_amount: 531000,
    status: "Paid",
  },
  {
    id: "OE-2",
    vendor_name: "Airtel Business Enterprise",
    category: "Internet & Telecom",
    invoice_no: "AB-TEL-9981",
    invoice_date: "2026-10-04",
    base_amount: 32000,
    gst_rate: 18,
    gst_amount: 5760,
    total_amount: 37760,
    status: "Paid",
  },
  {
    id: "OE-3",
    vendor_name: "Dell Technologies India",
    category: "Hardware & IT",
    invoice_no: "DEL-IN-2026-44",
    invoice_date: "2026-10-11",
    base_amount: 280000,
    gst_rate: 18,
    gst_amount: 50400,
    total_amount: 330400,
    status: "Pending",
  },
  {
    id: "OE-4",
    vendor_name: "Amazon Business Supplies",
    category: "Office Supplies",
    invoice_no: "AMZ-SUP-112",
    invoice_date: "2026-10-13",
    base_amount: 14500,
    gst_rate: 12,
    gst_amount: 1740,
    total_amount: 16240,
    status: "Pending",
  },
];

export const categories = [
  "Office Rent",
  "Internet & Telecom",
  "Hardware & IT",
  "Office Supplies",
  "Electricity & Utilities",
  "Legal & Professional",
];

export const gstRates = [0, 5, 12, 18, 28];
