export interface ProvinceResponse {
  id: string;
  name: string;
}

export interface RegencyResponse {
  id: string;
  name: string;
  provinceId: string;
}
