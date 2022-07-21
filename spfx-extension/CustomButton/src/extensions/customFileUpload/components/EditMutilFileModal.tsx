import { Table, Input, InputNumber, Popconfirm, Form } from "antd";
import * as React from "react";
import { FormUploadState } from "../interface";
import { FormComponentProps } from "antd/lib/form/Form";
const data = [];
for (let i = 0; i < 100; i++) {
  data.push({
    key: i.toString(),
    name: `Edrward ${i}`,
    age: 32,
    address: `London Park no. ${i}`,
  });
}
const EditableContext = React.createContext(null);
interface EditableCellProps extends FormComponentProps {
  inputType: string;
  editing: boolean;
  dataIndex: number;
  title: string;
  record: FormUploadState;
  index: number;
}
interface EditableCellState {
  data: any[];
  editingKey: "";
}

class EditableCell extends React.Component<
  EditableCellProps,
  EditableCellState
> {
  getInput = () => {
    if (this.props.inputType === "number") {
      return <InputNumber />;
    }
    return <Input />;
  };

  renderCell = ({ getFieldDecorator }) => {
    const {
      editing,
      dataIndex,
      title,
      inputType,
      record,
      index,
      children,
      ...restProps
    } = this.props;
    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item style={{ margin: 0 }}>
            {getFieldDecorator(dataIndex, {
              rules: [
                {
                  required: true,
                  message: `Please Input ${title}!`,
                },
              ],
              initialValue: record[dataIndex],
            })(this.getInput())}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };

  render() {
    return (
      <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer>
    );
  }
}

export class EditableTable extends React.Component<
  EditableCellProps,
  EditableCellState
> {
  columns: (
    | {
        title: string;
        dataIndex: string;
        width: string;
        editable: boolean;
        render?: undefined;
      }
    | {
        title: string;
        dataIndex: string;
        render: (text: any, record: any) => JSX.Element;
        width?: undefined;
        editable?: undefined;
      }
  )[];
  constructor(props) {
    super(props);
    this.state = { data, editingKey: "" };
    this.columns = [
      {
        title: "name",
        dataIndex: "name",
        width: "25%",
        editable: true,
      },
      {
        title: "age",
        dataIndex: "age",
        width: "15%",
        editable: true,
      },
      {
        title: "address",
        dataIndex: "address",
        width: "40%",
        editable: true,
      },
      {
        title: "operation",
        dataIndex: "operation",
        render: (text, record) => {
          const { editingKey } = this.state;
          const editable = this.isEditing(record);
          return editable ? (
            <span>
              <EditableContext.Consumer>
                {(form) => (
                  <a
                    onClick={() => this.save(form, record.key)}
                    style={{ marginRight: 8 }}
                  >
                    Save
                  </a>
                )}
              </EditableContext.Consumer>
              <Popconfirm
                title="Sure to cancel?"
                onConfirm={() => this.cancel()}
              >
                <a>Cancel</a>
              </Popconfirm>
            </span>
          ) : (
            <a
              style={
                editingKey !== ""
                  ? { visibility: "visible" }
                  : { visibility: "hidden" }
              }
              onClick={() => this.edit(record.key)}
            >
              Edit
            </a>
          );
        },
      },
    ];
  }

  isEditing = (record) => record.key === this.state.editingKey;

  cancel = () => {
    this.setState({ editingKey: "" });
  };

  save(form, key) {
    form.validateFields((error, row) => {
      if (error) {
        return;
      }
      const newData = [...this.state.data];
      const index = newData.findIndex((item) => key === item.key);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row,
        });
        this.setState({ data: newData, editingKey: "" });
      } else {
        newData.push(row);
        this.setState({ data: newData, editingKey: "" });
      }
    });
  }

  edit(key) {
    this.setState({ editingKey: key });
  }

  render() {
    const components = {
      body: {
        cell: EditableCell,
      },
    };

    const columns = this.columns.map((col) => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: (record) => ({
          record,
          inputType: col.dataIndex === "age" ? "number" : "text",
          dataIndex: col.dataIndex,
          title: col.title,
          editing: this.isEditing(record),
        }),
      };
    });

    return (
      <EditableContext.Provider value={this.props.form}>
        <Table
          components={components}
          bordered
          dataSource={this.state.data}
          columns={columns}
          rowClassName={(record: any, index: number) =>{
            return "editable-row"
          }}
          pagination={{
            onChange: this.cancel,
          }}
        />
      </EditableContext.Provider>
    );
  }
}

export const EditableFormTable = Form.create<EditableCellProps>()(EditableTable);