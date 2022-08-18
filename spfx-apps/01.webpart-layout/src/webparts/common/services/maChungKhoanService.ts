

import { MaChungKhoan } from "../models/MaChungKhoan";
import { BaseService } from "./baseService";

export class MaCKService extends BaseService<MaChungKhoan> {
  listName = "MaChungKhoan";
  site = "";
}

export const maCKService = new MaCKService();
