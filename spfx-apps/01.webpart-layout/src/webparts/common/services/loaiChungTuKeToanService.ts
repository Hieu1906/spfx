

import { LoaiChungTuKeToan } from "../models/LoaiChungTuKeToan";

import { BaseService } from "./baseService";

export class LoaiCTKTService extends BaseService<LoaiChungTuKeToan> {
  listName = "Loại Chứng từ Kế toán";
  site = "";
}

export const loaiCTKTService = new LoaiCTKTService();
