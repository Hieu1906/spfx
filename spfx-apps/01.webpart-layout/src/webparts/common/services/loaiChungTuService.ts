

import { LoaiChungTu } from "../models/LoaiChungTu";

import { BaseService } from "./baseService";

export class LoaiCTService extends BaseService<LoaiChungTu> {
  listName = "Loại Chứng từ";
  site = "";
}

export const loaiCTService = new LoaiCTService();
