import {useCallback, useEffect, useState} from "react";
import {ColumnsType} from "antd/es/table";
import {Button, Space, Table, Tag, Tooltip, Typography, Radio, RadioChangeEvent} from "antd";
import moment from "moment/moment";
import {invoke} from "@tauri-apps/api/core";
import {SyncOutlined} from "@ant-design/icons";
import {NotificationInstance} from "antd/lib/notification/interface";

function timeRender(time: number) {
    const {Text} = Typography;

    if (time === 0) {
        return <center>
            <Text type="secondary" style={{textAlign: "center"}}> -</Text>
        </center>
    }

    let seconds = Math.floor(time / 1000) % 60;
    let minute = Math.floor(Math.floor(time / 1000) / 60);
    let result = (minute < 10 ? "0" + minute : minute) + ":" + (seconds < 10 ? "0" + seconds : seconds)

    return (
        <center>
            <Tooltip placement="topLeft" title={result + "." + time % 1000}>
                {result}
            </Tooltip>
        </center>
    )
}

export interface Props {
    notif: NotificationInstance;
}

function RecordsTable({notif}: Props) {
    const [records, setRecords] = useState([])
    const [period, setPeriod] = useState('today')
    const [loadingRecords, setLoadingRecords] = useState(false)

    const updateRecords = useCallback(async () => {
        setLoadingRecords(true)
        try {
            setRecords(await invoke("update_records", {period: period}));
        } catch (err: any) {
            notif.error({
                message: "Failed to index records",
                description: JSON.parse(err).description,
                placement: "bottomLeft",
            });
        }
        setLoadingRecords(false)
    }, [records, period])

    useEffect(() => {
        (async () => await updateRecords())()
    }, [period])


    const splitFilters = [
        {
            text: 'Exclude empty',
            value: 'exclude-0',
        },
    ]
    const columns: ColumnsType<any> = [
        {
            title: 'World Name',
            dataIndex: 'world_name',
            ellipsis: true,
            fixed: 'left',
            render: (text) => (
                <Tooltip placement="topLeft" title={text}>
                    <a onClick={() => updateRecords}>{text}</a>
                </Tooltip>
            ),
        },
        {
            title: 'IGT',
            dataIndex: 'final_igt',
            fixed: 'left',
            sorter: (a, b) => b.final_igt - a.final_igt,
            render: timeRender
        },
        {
            title: 'Nether Enter',
            dataIndex: 'enter_nether',
            sorter: (a, b) => b.enter_nether - a.enter_nether,
            render: timeRender,
            filters: splitFilters,
            onFilter: (value, record) => {
                return value === 'exclude-0' && record.enter_nether !== 0
            },
        },
        {
            title: 'Bastion',
            dataIndex: 'enter_bastion',
            sorter: (a, b) => b.enter_bastion - a.enter_bastion,
            render: timeRender,
            filters: splitFilters,
            onFilter: (value, record) => {
                return value === 'exclude-0' && record.enter_bastion !== 0
            },
        },
        {
            title: 'Fortress',
            dataIndex: 'enter_fortress',
            sorter: (a, b) => b.enter_fortress - a.enter_fortress,
            render: timeRender,
            filters: splitFilters,
            onFilter: (value, record) => {
                return value === 'exclude-0' && record.enter_fortress !== 0
            },
        },
        {
            title: 'Nether Exit',
            dataIndex: 'nether_travel',
            sorter: (a, b) => b.nether_travel - a.nether_travel,
            render: timeRender,
            filters: splitFilters,
            onFilter: (value, record) => {
                return value === 'exclude-0' && record.nether_travel !== 0
            },
        },
        {
            title: 'Stronghold',
            dataIndex: 'enter_stronghold',
            sorter: (a, b) => b.enter_stronghold - a.enter_stronghold,
            render: timeRender,
            filters: splitFilters,
            onFilter: (value, record) => {
                return value === 'exclude-0' && record.enter_stronghold !== 0
            },
        },
        {
            title: 'End',
            dataIndex: 'enter_end',
            sorter: (a, b) => b.enter_end - a.enter_end,
            render: timeRender,
            filters: splitFilters,
            onFilter: (value, record) => {
                return value === 'exclude-0' && record.enter_end !== 0
            },
        },
        {
            title: 'RTA',
            dataIndex: 'final_rta',
            sorter: (a, b) => b.final_rta - a.final_rta,
            render: timeRender
        },
        {
            title: 'Date',
            dataIndex: 'date',
            ellipsis: true,
            fixed: 'right',
            sorter: (a, b) => {
                return b.date - a.date
            },
            render: (date) => (
                <Tooltip placement="topLeft" title={moment(date).format("MMMM Do YYYY, h:mm:ss a")}>
                    {moment(date).fromNow()}
                </Tooltip>
            )
        },
        {
            title: 'Tags',
            key: 'tags',
            dataIndex: 'tags',
            fixed: 'right',
            render: (_, record) => (
                <Space size={[0, 8]} wrap>
                    <Tag color={"orange"} bordered={false}>
                        {record.mc_version}
                    </Tag>
                    <Tag color={"geekblue"} bordered={false}>
                        {record.run_type}
                    </Tag>

                    {(() => {
                        if (record.is_completed) {
                            return (<Tag color={"green-inverse"} bordered={false}>completed</Tag>)
                        }
                    })()}
                    {(() => {
                        if (record.is_hardcore) {
                            return (<Tag color={"volcano"} bordered={false}>hardcore</Tag>)
                        }
                    })()}
                    {(() => {
                        if (record.is_coop) {
                            return (<Tag color={"cyan"} bordered={false}>co-op</Tag>)
                        }
                    })()}
                    {(() => {
                        if (record.is_cheat_allowed) {
                            return (<Tag color={"magenta"} bordered={false}>cheat-on</Tag>)
                        }
                    })()}
                </Space>
            ),
            filters: [
                {
                    text: 'version',
                    value: 'version-all',
                    children: [
                        {
                            text: '1.16.1',
                            value: 'version-1.16.1',
                        },
                        {
                            text: '1.15.2',
                            value: 'version-1.15.2',
                        },
                        {
                            text: '1.7.1',
                            value: 'version-1.7.1',
                        },
                        {
                            text: '1.20.0',
                            value: 'version-1.20.0',
                        },
                    ]
                },
            ]

        },
    ]

    return (
        <>
            <div style={{display: "flex", flexFlow: "row nowrap", justifyContent: "space-between", marginBottom: 10}}>
                <Radio.Group defaultValue="today" buttonStyle="solid"
                             onChange={(e: RadioChangeEvent) => setPeriod(e.target.value)}
                             disabled={loadingRecords}>
                    <Radio.Button value="today">Today</Radio.Button>
                    <Radio.Button value="yesterday">Yesterday</Radio.Button>
                    <Radio.Button value="week">This Week</Radio.Button>
                    <Radio.Button value="month">This Month</Radio.Button>
                    <Radio.Button value="all">All Time</Radio.Button>
                </Radio.Group>

                <Button type="dashed" icon={<SyncOutlined/>} onClick={updateRecords}
                        loading={loadingRecords}>
                    Update
                </Button>
            </div>
            <Table columns={columns} dataSource={records} loading={loadingRecords} sticky={{offsetScroll: -3}}
                   size={"middle"} bordered scroll={{x: 1500}} pagination={{size: "default"}}
            />
        </>
    )
}

export default RecordsTable