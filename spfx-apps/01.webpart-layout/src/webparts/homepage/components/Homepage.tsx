import { Button, Col, Modal, Row } from "antd";
import * as moment from "moment";
import * as React from "react";
import { IDataroom } from "../../../common/models/IDataroom";
import { IDataroomSite } from "../../../common/models/IDataroomSite";
import { dataroomService } from "../../../common/services/dataroomService";
import { dataroomSitesService } from "../../../common/services/dataroomSiteService";
import Avatar from "./avatar/Avatar";
import styles from "./Homepage.module.scss";
import { IHomepageProps } from "./IHomepageProps";
import { groupBy } from "lodash";
import * as strings from "DocumentAndSiteWebPartStrings";
export interface IHomepageStates {

  isModalVisible: boolean;
  titleModal: string;
}

export default class Homepage extends React.Component<
  IHomepageProps,
  IHomepageStates
> {
  drsGroup : {Title:string,backgroundColor?:string,imgUrl?:string}[]=[
    {
      Title:"Chứng từ lưu tạm"
    },
    {
      Title:"Hồ sơ mua sắm"
    },
    {
      Title:"Hồ sơ thanh toán"
    },
    {
      Title:"Hồ sơ tạm ứng"
    },
  ];
  constructor(props: IHomepageProps) {
    super(props);
    this.state = {
    
      isModalVisible: false,
      titleModal: "",
    };
  }




  renderModal() {
    let arr = [];
    for (let i = 2020; i <= moment().year(); i++) {
      arr.push(i);
    }
    return (
      <Modal
        width={700}
        className={styles.modal}
        footer={null}
        title={this.state.titleModal}
        visible={this.state.isModalVisible}
        onCancel={() => {
          this.setState({
            isModalVisible: false,
          });
        }}
      >
        <div className={styles.modal__listItem}>
          {arr.map((item) => (
            <div
              onClick={() => {
                window.open(
                  `${this.props.context.pageContext.web.absoluteUrl}/${item}`
                );
              }}
              className={styles.modal__listItem__item}
            >
              <div className={styles.modal__listItem__item__wrapperIcon}>
                {iconSite}
              </div>
              <div className={styles.modal__listItem__item__wrapperText}>
                <div
                  className={styles.modal__listItem__item__wrapperText__text}
                >
                  {this.state.titleModal}
                </div>
                <div
                  style={{ fontWeight: "bold" }}
                  className={styles.modal__listItem__item__wrapperText__text}
                >
                  Năm {item}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    );
  }

  
  public render(): React.ReactElement<IHomepageProps> {
    
    return (
      <div className={styles.homepage}>
          <div className={styles.drContainer}>
        <div className={styles.title}>{this.props.description?this.props.description:"CÔNG TY CỔ PHẦN CHỨNG KHOÁN SSI"} </div>
        
          <Row gutter={32} className={styles.drsParentContainer}>
            {this.drsGroup.map((item) => (
              <Col span={6}> <a
              className={styles.drsContainer}
              onClick={() => {
                this.setState({
                  isModalVisible: true,
                  titleModal: item.Title,
                });
              }}
            >
              <Avatar
                title={item.Title}
                imageUrl={item?.imgUrl ? item.imgUrl : undefined}
              />
              <div className={styles.drsTitle}>{item.Title}</div>
            </a></Col>
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
