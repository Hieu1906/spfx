

import { TaiKhoanNganHang } from "../models/TaiKhoanNganHang";
import { BaseService } from "./baseService";

export class TKNHService extends BaseService<TaiKhoanNganHang> {
  listName = "Tài Khoản Ngân Hàng";
  site = "";
}

export const tKNHService = new TKNHService();
