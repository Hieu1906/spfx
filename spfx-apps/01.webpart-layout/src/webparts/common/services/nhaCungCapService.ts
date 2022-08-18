

import { NhaCungCap } from "../models/NhaCungCap";
import { BaseService } from "./baseService";

export class NhaCungCapService extends BaseService<NhaCungCap> {
  listName = "NhaCungCap";
  site = "";
}

export const nhaCungCapService = new NhaCungCapService();
