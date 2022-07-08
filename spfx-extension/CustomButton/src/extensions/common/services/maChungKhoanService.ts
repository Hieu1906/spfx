

import { MaChungKhoan } from "../models/MaChungKhoan";
import { BaseService } from "./baseService";

export class MaCKService extends BaseService<MaChungKhoan> {
  listName = "Mã Chứng Khoán";
  site = "";
}

export const maCKService = new MaCKService();
