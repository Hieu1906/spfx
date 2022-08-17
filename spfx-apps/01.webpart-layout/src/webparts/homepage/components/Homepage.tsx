import { sp } from "@pnp/sp";
import "@pnp/sp/folders";
import "@pnp/sp/items";
import "@pnp/sp/lists";
import "@pnp/sp/webs";
import { Col, Modal, Row, Tabs } from "antd";
import * as moment from "moment";
import * as React from "react";
import { BaseComponent } from "../../common/components/BaseComponent";
import Avatar from "./avatar/Avatar";
import styles from "./Homepage.module.scss";
import { IHomepageProps } from "./IHomepageProps";

export interface ITreeItem {
  TypeNode: "DocLib" | "Site" | "Folder";
  RelativeUrl: string;
  AbsoluteUrl?: string;
  Created: moment.Moment;
  UniqueId: string;
  Title: string;
  IsLeaf?: boolean;
}

const { TabPane } = Tabs;
export interface IHomepageStates {
  isModalVisible: boolean;
  parentSite: ITreeItem[];
  subSiteLevel1: ITreeItem[];
  titleModal:string
}

export default class Homepage extends BaseComponent<
  IHomepageProps,
  IHomepageStates
> {
  constructor(props: IHomepageProps) {
    super(props);
    this.state = {
      isModalVisible: false,
      parentSite: [],
      subSiteLevel1: [],
      titleModal:""
    };
    this.onMount(async () => {
      await this.getParentSite();
    });
  }

  public async getParentSite() {
    let parentSiteUrl = `${this.props.context.pageContext.site.absoluteUrl}/apps/rfa/khoctkt`;
    let parentSite = await this.getSubSiteInCurrentSite(parentSiteUrl);
    this.setState({
      parentSite,
    });
  }

  public async getItemInSubSiteLevel1(item: ITreeItem) {
    let subSiteLevel1 = await this.getSubSiteInCurrentSite(item.AbsoluteUrl);
    this.setState({
      subSiteLevel1,
    });
  }

  public async getSubSiteInCurrentSite(parentSite: string) {
    let treeItem: ITreeItem[] = [];
    let subSites = await sp.configure({}, parentSite).web.webs.get();
    if (subSites && subSites.length > 0) {
      subSites.forEach((item) => {
        treeItem.push({
          UniqueId: item.Id,
          RelativeUrl: item.ServerRelativeUrl,
          AbsoluteUrl: item.Url,
          Title: item.Title,
          TypeNode: "Site",
          Created: moment(item.Created),
        });
      });
    }
    return treeItem || [];
  }

  renderModal() {
    let { subSiteLevel1 } = this.state;

    return (
      subSiteLevel1.length > 0 && (
        <Modal
          width={752}
          className={styles.modal}
          footer={null}
          title={this.state.titleModal&&this.state.titleModal}
          visible={this.state.isModalVisible}
          onCancel={() => {
            this.setState({
              isModalVisible: false,
            });
          }}
        >
          {subSiteLevel1.length > 1
            ? this.renderItemByTab(subSiteLevel1)
            : this.renderItem(subSiteLevel1[0])}
        </Modal>
      )
    );
  }

  renderItemByTab(items: ITreeItem[]) {
    return (
      <Tabs>
        {items.map((item) => (
          <TabPane tab={<span>{item.Title}</span>} key={item.UniqueId}>
            {this.renderItem(item)}
          </TabPane>
        ))}
      </Tabs>
    );
  }

  renderItem(item: ITreeItem) {
    let arr = [];
    for (let i = 2020; i <= moment().year(); i++) {
      arr.push(i);
    }
    return (
      <div className={styles.modal__listItem}>
        {arr.map((year) => (
          <div
            onClick={() => {
              window.open(
                `${item.AbsoluteUrl}/${year}`
              );
            }}
            className={styles.modal__listItem__item}
          >
            <div className={styles.modal__listItem__item__wrapperIcon}>
              {iconSite}
            </div>
            <div className={styles.modal__listItem__item__wrapperText}>
              <div className={styles.modal__listItem__item__wrapperText__text}>
                {item?.Title}
              </div>
              <div
                style={{ fontWeight: "bold" }}
                className={styles.modal__listItem__item__wrapperText__text}
              >
                Năm {year}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  public render(): React.ReactElement<IHomepageProps> {
    return (
      <div className={styles.homepage}>
        <div className={styles.drContainer}>
          <div className={styles.title}>
            {this.props.description
              ? this.props.description
              : "CÔNG TY CỔ PHẦN CHỨNG KHOÁN SSI"}{" "}
          </div>

          <Row gutter={32} className={styles.drsParentContainer}>
            {this.state.parentSite.map((item) => (
              <Col span={6}>
                <a
                  className={styles.drsContainer}
                  onClick={async () => {
                    this.setState({
                      isModalVisible: true,
                      titleModal:item.Title
                    });
                    this.getItemInSubSiteLevel1(item);
                  }}
                >
                  <Avatar title={item.Title} />
                  <div className={styles.drsTitle}>{item.Title}</div>
                </a>
              </Col>
            ))}
          </Row>
        </div>
        {this.renderModal()}
      </div>
    );
  }
}
const iconSite = (
  <svg
    width="16"
    height="17"
    viewBox="0 0 16 17"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M1.19434 1.04764C1.19434 0.637318 1.52697 0.304688 1.93729 0.304688H13.8245C14.2348 0.304688 14.5675 0.637318 14.5675 1.04764V6.50535C14.5675 6.91567 14.2348 7.2483 13.8245 7.2483H1.93729C1.52697 7.2483 1.19434 6.91567 1.19434 6.50535V1.04764Z"
      fill="#3A8CE4"
    />
    <path
      d="M4.66602 4.86033V2.66211H11.2813V4.86033H4.66602Z"
      stroke="white"
    />
    <path
      d="M1.19434 9.24295C1.19434 8.83263 1.52697 8.5 1.93729 8.5H13.8245C14.2348 8.5 14.5675 8.83263 14.5675 9.24295V14.7007C14.5675 15.111 14.2348 15.4436 13.8245 15.4436H1.93729C1.52697 15.4436 1.19434 15.111 1.19434 14.7007V9.24295Z"
      fill="#3A8CE4"
    />
    <path
      d="M4.66602 13.0556V10.8574H11.2813V13.0556H4.66602Z"
      stroke="white"
    />
  </svg>
);
