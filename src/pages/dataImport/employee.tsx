import React, { useContext, useEffect, useRef, useState } from 'react';
import type { GetRef, InputRef } from 'antd';
import { Button, Form, Input, Table, Upload } from 'antd';
import * as XLSX from 'xlsx'
type FormInstance<T> = GetRef<typeof Form<T>>;
import { UploadOutlined } from '@ant-design/icons';

const EditableContext = React.createContext<FormInstance<any> | null>(null);

interface Item {
  name: string;
  num: string;
  department: string;
}

interface EditableRowProps {
  index: number;
}

const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  dataIndex: keyof Item;
  record: Item;
  handleSave: (record: Item) => void;
}

const EditableCell: React.FC<React.PropsWithChildren<EditableCellProps>> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<InputRef>(null);
  const form = useContext(EditableContext)!;

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({ [dataIndex]: record[dataIndex] });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();

      toggleEdit();
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{ margin: 0 }}
        name={dataIndex}
        rules={[
          {
            required: true,
            message: `${title} is required.`,
          },
        ]}
      >
        <Input ref={inputRef} onPressEnter={save} onBlur={save} />
      </Form.Item>
    ) : (
      <div className="editable-cell-value-wrap" style={{ paddingRight: 24 }} onClick={toggleEdit}>
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

type EditableTableProps = Parameters<typeof Table>[0];

interface DataType {
  key: React.Key;
  name: string;
  num: string;
  department: string;
}

type ColumnTypes = Exclude<EditableTableProps['columns'], undefined>;

const App: React.FC = () => {
  const [dataSource, setDataSource] = useState<DataType[]>([]);
  const defaultColumns: (ColumnTypes[number] & { editable?: boolean; dataIndex: string })[] = [
    {
      title: '编号',
      dataIndex: 'num',
    },
    {
      title: '姓名',
      dataIndex: 'name',
      width: '30%',
      editable: true,
    },
    {
      title: '部门',
      dataIndex: 'department',
    },
  ];
  const handleSave = (row: DataType) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    setDataSource(newData);
  };

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const columns = defaultColumns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: DataType) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
      }),
    };
  });


  const [xlsxDataForEmployee, setXlsxDataForEmployee] = useState<any[]>([])


  function dealExcel(ws: any) {
    let keymap: any = {  // 我们要转换的开头
      "员工": "name",
      "工号": 'num',
      "部门": 'department'
    }
    ws.forEach((sourceObj: any) => {
      Object.keys(sourceObj).map(keys => {
        let newKey = keymap[keys]
        if (newKey) {
          sourceObj[newKey] = sourceObj[keys]
          delete sourceObj[keys]
        }
      })
    })
    localStorage.setItem('Employee', JSON.stringify(ws))
    setXlsxDataForEmployee(ws)
  }


  const changeExcel = (info: any) => {
    const files = info.fileList
    if (files.length <= 0) {
      return false
    } else if (!/\.(xls|xlsx)$/.test(files[0].name.toLowerCase())) {
      console.log('上传格式不正确，请上传xls或者xlsx格式')
      return false
    }
    // 读取表格
    const fileReader = new FileReader()
    fileReader.onload = (ev: any) => {
      const workbook = XLSX.read(ev.target.result, {
        type: "binary"
      })
      const wsname = workbook.SheetNames[0]
      const ws = XLSX.utils.sheet_to_json(workbook.Sheets[wsname])
      console.log('ws:', ws) // 转换成json的数据
      dealExcel(ws) //...对数据进行自己需要的操作 
      setXlsxDataForEmployee(ws)
    }
    fileReader.readAsBinaryString(files[0].originFileObj)
  }

  useEffect(() => {
    setXlsxDataForEmployee(JSON.parse(localStorage.getItem('Employee') || '[]'))
  }, [])


  return (
    <div style={{ padding: 20, paddingTop: 0 }}>
      <Upload
        maxCount={1}
        accept=".xls,.xlsx"
        onChange={changeExcel}
        showUploadList={false}
      >
        <Button type="primary" style={{ marginBottom: 16 }} icon={<UploadOutlined />}>导入员工</Button>
      </Upload>
      <Table
        components={components}
        rowClassName={() => 'editable-row'}
        bordered
        dataSource={xlsxDataForEmployee}
        columns={columns as ColumnTypes}
      />
    </div>
  );
};

export default App;