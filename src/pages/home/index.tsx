// @flow 
import { Button, Card, Col, Radio, RadioChangeEvent, Row, Space } from 'antd';
import './index.css'
import { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx'
import { ExportOutlined } from '@ant-design/icons'

interface BaseInfoType {
  title: string;
  titleColor: string;
  fontColor: string;
  prizeFontSize?: number;
  winnerFontSize?: number;
}
interface EmployeeType { name: string; num: number; department: number }
interface PrizeType { name: string, num: number, count: number, winners: EmployeeType[] }
function getRandomIndexes(arrayLength: number, count: number) {
  if (count > arrayLength) {
    throw new Error("Count cannot be greater than the length of the array.");
  }
  const indexes = new Set();
  while (indexes.size < count) {
    const randomIndex = Math.floor(Math.random() * arrayLength);
    indexes.add(randomIndex);
  }

  return Array.from(indexes);
}
const initConfig = {
  title: '抽奖',
  titleColor: 'black',
  fontColor: "black",
  prizeFontSize: 20,
  winnerFontSize: 20,
}
const Home = () => {
  const timer = useRef<any>(null)
  const [baseInfo, setBaseInfo] = useState<BaseInfoType>(initConfig)
  const [btnState, setBtnState] = useState(true)
  const [selectPrize, setSelectPrize] = useState(1);
  const [winnerList, setWinnerList] = useState<EmployeeType[]>([])
  const [selectPrizeInfo, setSelectPrizeInfo] = useState<PrizeType>();
  const [prizeList, setPrizeList] = useState<PrizeType[]>([]);
  const [employeeList, setEmployeeList] = useState<EmployeeType[]>([]);

  const base64Image = localStorage.getItem('BgImg') || '';

  const boxStyle = {
    backgroundColor: '#f0f0f0',
    backgroundImage: `url(${base64Image})`,
    backgroundSize: 'cover', // 或其他背景尺寸设置，如'contain', '100% 100%'等
    backgroundPosition: 'center', // 设置图片在背景中的位置
  };

  useEffect(() => {
    const config = JSON.parse(localStorage.getItem('ConfigData') || '{}')
    setBaseInfo({ ...initConfig, ...config })
  }, [])

  const onChange = (e: RadioChangeEvent) => {
    setSelectPrizeInfo(() => {
      return prizeList.find((item: any) => item.num === e.target.value)
    });
    setSelectPrize(e.target.value)
    setWinnerList(() => {
      return prizeList.find((item: any) => item.num === e.target.value)?.winners || []
    })
  };
  useEffect(() => {
    setPrizeList(JSON.parse(localStorage.getItem('Prize') || '[]').map((item: PrizeType) => {
      return {
        ...item,
        winners: []
      }
    }))
    setEmployeeList(JSON.parse(localStorage.getItem('Employee') || '[]'))
  }, [])

  const startHandle = () => {
    timer.current = setInterval(() => {
      const indexes = getRandomIndexes(employeeList.length, selectPrizeInfo?.count || 0)
      setWinnerList(() => {
        return indexes.map((item: any) => {
          return employeeList[item]
        })
      })
    }, 100)
    setBtnState(false)
  }
  const finishHandle = () => {
    clearInterval(timer.current)
    console.log('winnerList', winnerList)
    setPrizeList(origin => {
      const prizeListWithWinners = origin.map((item: any) => {
        if (item.num === selectPrizeInfo?.num) {
          return {
            ...item,
            winners: winnerList
          }
        } else {
          return item
        }
      })
      localStorage.setItem('exportPrizeWithWinner', JSON.stringify(prizeListWithWinners))
      return prizeListWithWinners
    })
    setBtnState(true)
  }

  // 定义一个辅助函数来处理嵌套的数据结构，使其适合展平到Excel表格中
  const processWinners = (winners: any[]) => {
    return winners.map((winner) => ({
      '奖品编号': '',
      '奖项': '',
      '数量': '',
      '备注': '',
      '获奖者编号': winner.num,
      '获奖者姓名': winner.name,
      '部门': winner.department || '无'
    }));
  };


  const handleExport = () => {
    // 遍历JSON数据，准备展平的数据结构
    const jsonData = JSON.parse(localStorage.getItem('exportPrizeWithWinner') || '[]')
    const flattenedData: any[] = [];
    jsonData.forEach((item: any, idx: number) => {
      // 添加奖品信息行
      flattenedData.push({
        '奖品编号': item.num,
        '奖项': item.name,
        '数量': item.count,
        '备注': item.remark,
        '获奖者编号': '',
        '获奖者姓名': '',
        '部门': ''
      });

      // 如果有获奖者，处理并添加获奖者信息
      if (item.winners.length > 0) {
        flattenedData.push(...processWinners(item.winners));
      }
    });

    // 转换数据为工作簿对象
    const ws = XLSX.utils.json_to_sheet(flattenedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "奖品信息");
    XLSX.writeFile(wb, "中奖信息.xlsx");
  };
  const exportHandle = () => {
    handleExport()
  }
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', ...boxStyle }}>
      <Row>
        <Col span={24} style={{ height: 120, lineHeight: 2 }}>
          <div className='title' style={{ color: baseInfo.titleColor }}>{baseInfo.title}</div>
        </Col>
      </Row>
      <Row justify={'center'} gutter={10} style={{ padding: 5 }} >
        <Col span={12} className='content'>
          <Card title={<Button onClick={exportHandle} icon={<ExportOutlined />} type="text" iconPosition={'end'}>
            奖品列表
          </Button>} style={{ width: '100%' }}>
            <Radio.Group onChange={onChange} value={selectPrize} style={{ maxHeight: 600 }}>
              <Row>

                {
                  prizeList.map((item: any) => {
                    return <Col span={8}><Radio value={item.num} style={{ fontSize: baseInfo.prizeFontSize + 'px', color: baseInfo.fontColor }}>
                      <span style={{ display: 'inline-block' }}>{item.name}</span>
                      <span> 共{item.count}人</span>
                    </Radio></Col>
                  })
                }
              </Row>

            </Radio.Group>

          </Card>
        </Col>
        <Col span={12} className='content'>
          <Card title={selectPrizeInfo ? '中奖名单 - ' + selectPrizeInfo?.count + '人' : '中奖名单'} style={{ width: '100%' }}>
            <Row gutter={16}>
              {winnerList.map((item: EmployeeType) => {
                return <Col className="gutter-row" span={6}>
                  <p style={{ fontSize: baseInfo.winnerFontSize + 'px', color: baseInfo.fontColor }}>
                    <span>{item.name}</span>
                    <span style={{ marginLeft: 10 }}>{item.department}</span>
                  </p></Col>
              })}
            </Row>

          </Card>
        </Col>
      </Row>
      <Row justify={'center'} gutter={10} style={{
        position: 'absolute',
        left: '50%',
        bottom: '20%',
        zIndex: 9999,
        transform: 'translate(-50%, 50%)'
      }} >
        <Button disabled={!selectPrizeInfo || !btnState} onClick={startHandle} type="primary" style={{ width: 100, height: 40, fontSize: 20, margin: 5 }}>开始</Button>
        <Button disabled={btnState} onClick={finishHandle} style={{ width: 100, height: 40, fontSize: 20, margin: 5 }}>暂停</Button>
      </Row>
    </div>
  );
};

export default Home;