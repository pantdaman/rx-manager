export interface MedicineSearchResult {
  medicineId: string;
  generic_Name: string;
  companyName: string;
  mrp: string;
  photoPath: string;
  unitSize: string;
  iS_BPPI_PRODUCT: string;
  iS_GENERIC: string;
  gC_ID: string;
  savingsPerc: string | null;
  savingAmount: string | null;
  unitSizeText: string;
  peR_UNIT_MRP: string;
  itemCode: string;
  totalRecord: string;
}

export interface MedicineSearchResponse {
  rs: string;
  rc: string;
  rd: string;
  pd: {
    success: string;
    message: string;
    data: MedicineSearchResult[];
  };
} 