import React from 'react';
import type { FormProps } from 'antd';
import { Button, Checkbox, Form, Input, InputNumber, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

type FieldType = {
  title?: string;
  titleColor?: string;
  fontColor?: string;
  prizeFontSize?: number;
  winnerFontSize?: number;
  bgImg?: any;
};

const initialValues = {
  title: '抽奖',
  titleColor: 'black',
  fontColor: 'black',
  prizeFontSize: 20,
  winnerFontSize: 20,
};

const handleImageUpload = (file: any) => {
  if (!file) return;
  // 使用FileReader读取文件
  const reader = new FileReader();
  reader.onloadend = () => {
    // 文件读取完成后，得到的结果是Base64编码的字符串
    const base64String = reader.result;
    // setImageBase64(base64String);
    // 保存到localStorage
    localStorage.setItem('BgImg', base64String as string);
  };
  reader.readAsDataURL(file);
};

const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
  console.log('Success:', { ...initialValues, ...values });
  const configData={ ...initialValues, ...values };
  delete configData.bgImg
  localStorage.setItem('ConfigData', JSON.stringify(configData));
  handleImageUpload(values.bgImg[0].originFileObj)
};

const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
  console.log('Failed:', errorInfo);
};



const normFile = (e: any) => {
  console.log('Upload event:', e);
  if (Array.isArray(e)) {
    return e;
  }
  return e?.fileList;
};
const App: React.FC = () => (
  <Form
    name="basic"
    labelCol={{ span: 8 }}
    wrapperCol={{ span: 16 }}
    style={{ maxWidth: 600, margin: '20px auto' }}
    initialValues={initialValues}
    onFinish={onFinish}
    onFinishFailed={onFinishFailed}
    
    autoComplete="off"
  >
    <Form.Item<FieldType>
      label="标题"
      name="title"
    >
      <Input />
    </Form.Item>
    <Form.Item<FieldType>
      label="标题颜色"
      name="titleColor"
    >
      <Input />
    </Form.Item>
    <Form.Item<FieldType>
      label="字体颜色"
      name="fontColor"
    >
      <Input />
    </Form.Item>

    <Form.Item<FieldType>
      label="奖品字体大小"
      name="prizeFontSize"
    >
      <InputNumber  />
    </Form.Item>
    <Form.Item<FieldType>
      label="中奖字体大小"
      name="winnerFontSize"
    >
      <InputNumber  />
    </Form.Item>
    <Form.Item
      name="bgImg"
      label="上传背景图"
      valuePropName="fileList"
      getValueFromEvent={normFile}
    >
      <Upload name="logo" accept=".jpg,.jpeg,.png,.gif" listType="picture">
        <Button icon={<UploadOutlined />}>点击上传</Button>
      </Upload>
    </Form.Item>
    <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
      <Button type="primary" htmlType="submit">
        Submit
      </Button>
    </Form.Item>
  </Form>
);

export default App;