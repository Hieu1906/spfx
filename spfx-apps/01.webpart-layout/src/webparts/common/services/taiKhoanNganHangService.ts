

import { TaiKhoanNganHang } from "../models/TaiKhoanNganHang";
import { BaseService } from "./baseService";

export class TKNHService extends BaseService<TaiKhoanNganHang> {
  listName = "TaiKhoanNganHang";
  site = "";
}

export const tKNHService = new TKNHService();
