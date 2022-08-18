
import { BoPhan } from "../models/BoPhan";
import { BaseService } from "./baseService";

export class BoPhanService extends BaseService<BoPhan> {
  listName = "BoPhanDauMoi";
  site = "";
}

export const boPhanService = new BoPhanService();
