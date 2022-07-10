import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/folders";
import * as _ from "lodash";

export interface QueryOption {
  orderBy?: string;
  filter?: string;
}
export abstract class BaseService<T> {
  listName: string;
  site: string;

  async getAll(queryOption?: QueryOption) {
    const f = sp
      .configure({}, `${this.site}`)
      .web.lists.getByTitle(this.listName)
      .items.top(5000);
    if (_.get(queryOption, "orderBy", "") !== "") {
      f.orderBy(queryOption.orderBy, true);
    }
    if (_.get(queryOption, "filter", "") !== "") {
      f.filter(queryOption.filter);
    }

    return (await f.get()) as T[];
  }
}
