import * as React from "react";
import styles from "./DocumentAndSite.module.scss";
import { IDocumentAndSiteProps } from "./IDocumentAndSiteProps";
import { IDocumentAndSiteState, ItemRender } from "./IDocumentAndSiteState";
import { Col, Row, Spin } from "antd";
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/folders";
import * as moment from "moment";

export default class DocumentAndSite extends React.Component<
  IDocumentAndSiteProps,
  IDocumentAndSiteState
> {
  private defaultFolders = [
    "_private",
    "SitePages",
    "_catalogs",
    "_vti_pvt",
    "_cts",
    "Lists",
    "Style Library",
    "images",
    "Site Assets",
    "Form",
    "Forms",
    "SiteAssets",
    "Document"
  ];

  private defaultList = [
    "appdata",
    "appfiles",
    "Composed Looks",
    "Events",
    "List Template Gallery",
    "Master Page Gallery",
    "Site Assets",
    "Site Pages",
    "Solution Gallery",
    "Style Library",
    "TaxonomyHiddenList",
    "Theme Gallery",
    "User Information List",
    "Web Part Gallery",
    "Documents"
  ];
  constructor(props: IDocumentAndSiteProps) {
    super(props);
    this.state = {
      loading: true,
      allData: [],
    };
  }

  async componentDidMount() {
    await Promise.all([this.loadData()]);
  }

  async loadData() {
    this.setState({
      loading: true,
    });
    let [subSites, folders] = await Promise.all([
      this.getSubSiteInCurrentSite(),
      this.getFolderInDoclib(),
    ]);
    let allData = subSites.concat(folders);
    this.setState({
      allData,
    });
    this.setState({
      loading: false,
    });
  }

  async getSubSiteInCurrentSite() {
    let subSites = await sp.web.webs.get();
    if (subSites && subSites.length > 0) {
      subSites = subSites.map((item) => {
        return {
          UniqueId: item.Id,
          ServerRelativeUrl: item.ServerRelativeUrl,
          AbsoluteUrl: item.Url,
          Title: item.Title,
          Created: moment(item.Created),
          Type: "Site",
        };
      }) as any[];
    }
    return (subSites as unknown as ItemRender[]) || [];
  }

  //lấy ra các doclib từ thông tin site truyền vào
  async getFolderInDoclib() {
    let listFolders: any[];
    let lists = await sp
      .configure({}, this.props.context.pageContext.web.absoluteUrl)
      .web.lists.get();
    listFolders = lists.filter((item) => {
      return !this.defaultList.includes(item.Title) && item.BaseTemplate == 101;
    });
    console.log(listFolders)
    if (listFolders && listFolders.length > 0) {
      listFolders = listFolders.map((item) => {
        return {
          UniqueId: item.Id,
          Title: item.Title,
          Type: "DocLib",
          ServerRelativeUrl: item.DocumentTemplateUrl
            ? item.DocumentTemplateUrl.replace("/Forms/template.dotx", "")
            : `${item.ParentWebPath.DecodedUrl}/Lists/${item.Title}`,
          Created: moment(item.TimeCreated),
          AbsoluteUrl: this.props.context.pageContext.web.absoluteUrl,
        };
      });
    }

    return (listFolders as ItemRender[]) || [];
  }
  public render(): React.ReactElement<IDocumentAndSiteProps> {
    let iconFolder: string = require("../images/folder.svg");
    let iconSubSite: string = require("../images/subsite.svg");
    return (
      <Spin spinning={this.state.loading}>
        <div className={styles.documentAndSite}>
          <div className={styles.documentAndSite__title}>
            {this.props.context.pageContext.web.title}
          </div>
          {this.state.allData.length > 0 ? (
            <div className={styles.documentAndSite__listItem}>
              {this.state.allData.map((item: ItemRender) => (
                <div className={styles.documentAndSite__listItem__item}>
                  <img
                    onClick={() => {
                      window.open(
                        item.Type == "Site"
                          ? `${item.ServerRelativeUrl}/SitePages/Home.aspx`
                          : `${item.ServerRelativeUrl}`,
                        "_self"
                      );
                    }}
                    className={styles.documentAndSite__listItem__item__img}
                    src={item.Type == "DocLib" ? iconFolder : iconSubSite}
                  />
                  <div
                    onClick={() => {
                      window.open(
                        item.Type == "Site"
                          ? `${item.ServerRelativeUrl}/SitePages/Home.aspx`
                          : `${item.ServerRelativeUrl}`,
                        "_self"
                      );
                    }}
                    className={styles.documentAndSite__listItem__item__text}
                  >
                    {item.Title}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </Spin>
    );
  }
}
