

import { LoaiChungTu } from "../models/LoaiChungTu";

import { BaseService } from "./baseService";

export class LoaiCTService extends BaseService<LoaiChungTu> {
  listName = "LoaiChungTu";
  site = "";
}

export const loaiCTService = new LoaiCTService();
