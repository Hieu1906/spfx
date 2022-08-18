

import { LoaiChungTuKeToan } from "../models/LoaiChungTuKeToan";

import { BaseService } from "./baseService";

export class LoaiCTKTService extends BaseService<LoaiChungTuKeToan> {
  listName = "LoaiChungTuKeToan";
  site = "";
}

export const loaiCTKTService = new LoaiCTKTService();
