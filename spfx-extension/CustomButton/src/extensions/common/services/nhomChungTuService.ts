

import { NhomChungTu } from "../models/NhomChungTu";
import { BaseService } from "./baseService";

export class NhomCTService extends BaseService<NhomChungTu> {
  listName = "NhomChungTu";
  site = "";
}

export const nhomCTService = new NhomCTService();
