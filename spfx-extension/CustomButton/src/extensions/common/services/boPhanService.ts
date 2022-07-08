
import { BoPhan } from "../models/BoPhan";
import { BaseService } from "./baseService";

export class BoPhanService extends BaseService<BoPhan> {
  listName = "Bộ Phận Đầu Mối";
  site = "";
}

export const boPhanService = new BoPhanService();
