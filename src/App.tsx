import {useCallback, useEffect, useState} from "react";
import {invoke} from "@tauri-apps/api/core";
import {info} from "@tauri-apps/plugin-log";
import {getVersion} from "@tauri-apps/api/app";
import {check} from "@tauri-apps/plugin-updater";
import {relaunch} from "@tauri-apps/plugin-process";
import {ConfigProvider, Typography, Table, Button, Divider, Tooltip, Tag, Space, notification} from 'antd'
import {InfoCircleFilled, SyncOutlined} from '@ant-design/icons';
import {ColumnsType} from "antd/es/table";
import {Modal} from 'antd';
import moment from "moment";

const {confirm} = Modal;

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

function App() {
    const [updateCheck, setUpdateCheck] = useState(false)
    const [notif, notifContextHolder] = notification.useNotification();

    useEffect(() => {
        (async () => {
            console.log(updateCheck)
            if (updateCheck) {
                notif.info({
                    message: "Checking for new updates",
                    description: "Please wait for me fetch updates from github...",
                    placement: "bottomLeft",
                });
            }

            try {
                await info("Checking for an update...");
                const update = await check();
                await info("Update check results: " + JSON.stringify(update));
                if (update?.available) {
                    await info("Updates available!");
                    confirm({
                        title: 'An update available!',
                        icon: <InfoCircleFilled/>,
                        content: '💠 Bug fixes and minor improvements.',
                        okText: 'Install',
                        async onOk() {
                            try {
                                return await new Promise(async () => {
                                    await info("Downloading updates...");
                                    await update.downloadAndInstall();
                                    await update.downloadAndInstall()
                                    await info("Completed, relaunching...");
                                    await relaunch();
                                });
                            } catch {
                                return console.log('Oops errors!');
                            }
                        },
                        onCancel() {
                        },
                    });

                    return;
                } else {
                    await info("No updates available!");
                    if (updateCheck) {
                        notif.success({
                            message: "You are already up to date",
                            placement: "bottomLeft",
                        });
                        setUpdateCheck(false)
                    }
                }
            } catch (e) {
                await info(String(e))

                if (updateCheck) {
                    notif.error({
                        message: "Update check failed!",
                        description: String(e),
                        btn: <Button onClick={() => setUpdateCheck(true)}>Retry</Button>,
                        placement: "bottomLeft",
                    });
                    setUpdateCheck(false)
                }
            }
        })()
    }, [updateCheck])

    const [version, setVersion] = useState('0.0.0')
    const [records, setRecords] = useState([])
    const [loadingRecords, setLoadingRecords] = useState(false)

    const splitFilters = [
        {
            text: 'exclude empty',
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
                    <a onClick={updateRecords}>{text}</a>
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

    const updateRecords = useCallback(async () => {
        setLoadingRecords(true)
        setRecords(await invoke("update_records"));
        setLoadingRecords(false)
    }, [records])

    useEffect(() => {
        (async () => {
            setVersion(await getVersion())
        })()
    }, [])

    const {Title} = Typography;
    return (
        <ConfigProvider>
            {notifContextHolder}
            <Typography>
                <Title style={{textAlign: "center"}}>MCSR Analytics!
                    <a title={"click to check updates"} onClick={() => setUpdateCheck(true)}>
                        <Tag color={"green"} bordered={true} className={"ml-1.5"}>v{version}</Tag>
                    </a>
                </Title>
                <Divider orientation={"left"} style={{fontSize: 21}}></Divider>
                <div style={{display: "flex", marginBottom: 10}}>
                    <Button style={{marginLeft: "auto"}} type={"primary"} icon={<SyncOutlined/>} onClick={updateRecords}
                            loading={loadingRecords}>
                        Update
                    </Button>
                </div>
                <Table columns={columns} dataSource={records} loading={loadingRecords} sticky size={"middle"} bordered
                       scroll={{x: 1500}}/>
            </Typography>
        </ConfigProvider>

    )
}

export default App
