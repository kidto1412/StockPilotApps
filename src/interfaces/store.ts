export interface StoreRequest {
  name: string;
  address: string;
  province: string;
  regency: string;
  logoUrl?: string | null;
  ownerId: string;
  businessTypeId: string;
}
