

import { NhomChungTu } from "../models/NhomChungTu";
import { BaseService } from "./baseService";

export class NhomCTService extends BaseService<NhomChungTu> {
  listName = "Nhóm Chứng từ";
  site = "";
}

export const nhomCTService = new NhomCTService();
