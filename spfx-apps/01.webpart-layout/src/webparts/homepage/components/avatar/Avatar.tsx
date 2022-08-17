import * as React from "react";
import styles from "./../Homepage.module.scss";

export interface IProps {
  title: string;

}
export interface IStates {
  
}

const palleteColor = [
  "#597EF7",
  "#13C2C2",
  "#B37FEB",
  "#DB915B",
  "#7CB305",
  "#FF8F62",
  "#FAAD14",
  "#FF89B5",
];
export default class Avatar extends React.Component<IProps, IStates> {
  constructor(props: IProps) {
    super(props);
 
  }
  getAvt() {
    const { title } = this.props;
    const names = (title || "").split(" ").map((n: any) => {
      let index = 0;
      while (true) {
        const c = n.charAt(index);
        if (c.match(/[a-z,A-Z]/i) !== null) {
          break;
        }
        index++;
        if (index >= n.length) {
          break;
        }
      }
      if (index >= n.length) {
        return "";
      }
      return n.charAt(index);
    });
    // tính mã màu avt bằng cách chia lấy dư kí tự đầu và kí tự cuối cho tổng mã màu
    let takeColorIdx =
      (names[1]
        ? names[0].charCodeAt(0) + names[1].charCodeAt(0)
        : names[0].charCodeAt(0)) % palleteColor.length;

    const name = names.join("");
    return {
      title:name.substring(name.length - 2, name.length).toUpperCase(),
      backgroundColor:palleteColor[takeColorIdx]
    }
  }



  public render(): React.ReactElement<IProps> {
    return (
      <div
        style={{
          display: "flex",
          backgroundColor: this.getAvt().backgroundColor,
          minWidth: "80px",
          height: "80px",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div className={styles.avaTitle}> {this.getAvt().title}</div>
      </div>
    )
      

  }
}
