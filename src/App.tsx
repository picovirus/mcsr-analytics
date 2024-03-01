import {useEffect, useState} from "react";
import {info} from "@tauri-apps/plugin-log";
import {getVersion} from "@tauri-apps/api/app";
import {check} from "@tauri-apps/plugin-updater";
import {Window} from '@tauri-apps/api/window';
import {exit, relaunch} from "@tauri-apps/plugin-process";
import {Store} from "@tauri-apps/plugin-store";
import {
    notification,
    ConfigProvider,
    theme,
    Typography,
    Tag,
    Divider,
    Button,
    Modal,
    Layout,
    Dropdown,
    MenuProps
} from 'antd'
import {CloudSyncOutlined, FullscreenOutlined, InfoCircleFilled, LogoutOutlined, SyncOutlined} from '@ant-design/icons';
import RecordsTable from "./RecordsTable.tsx";

function App() {
    const [updateCheck, setUpdateCheck] = useState(false)
    const [notif, notifContextHolder] = notification.useNotification();

    // fixme use effect executes two times! before and after setUpdateCheck(true) and setUpdateCheck(false)
    useEffect(() => {
        (async () => {
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
                    Modal.confirm({
                        title: 'An update available!',
                        icon: <InfoCircleFilled/>,
                        content: '💠 Bug fixes and minor improvements.',
                        okText: 'Install',
                        async onOk() {
                            try {
                                return await new Promise(async () => {
                                    await info("Downloading updates...");
                                    await update.downloadAndInstall();
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
    useEffect(() => {
        (async () => {
            setVersion(await getVersion())
        })()
    }, [])

    const [darkTheme, setDarkTheme] = useState(false)
    const store = new Store("settings.dat");
    useEffect(() => {
        (async () => {
            setDarkTheme(await store.get("theme") ?? darkTheme)
        })()
    }, [])

    useEffect(() => {
        (async () => {
            await store.set("theme", darkTheme)
            await store.save()
        })()
    }, [darkTheme])

    const items: MenuProps['items'] = [
        {
            key: '1',
            label: 'Reload',
            icon: <SyncOutlined/>,
            onClick: () => location.reload()
        },
        {
            key: '2',
            label: 'Full screen',
            icon: <FullscreenOutlined/>,
            onClick: () => Window.getCurrent().isFullscreen().then((result) => Window.getCurrent().setFullscreen(!result))
        },
        {
            key: '3',
            label: 'Check for updates',
            icon: <CloudSyncOutlined/>,
            onClick: () => setUpdateCheck(true)
        },
        {
            key: '4',
            label: 'Exit',
            icon: <LogoutOutlined/>,
            onClick: () => exit(),
            danger: true
        },
    ];

    return (
        <ConfigProvider theme={{
            token: {
                colorBgBase: darkTheme ? "#0a0a0c" : "#ffffff",
                colorBgContainer: darkTheme ? "#0e0e11" : "#ffffff"
            },
            algorithm: darkTheme ? theme.darkAlgorithm : theme.defaultAlgorithm
        }}>
            {notifContextHolder}
            <Dropdown menu={{items}} trigger={['contextMenu']}>
                <Layout className={"p-4 pt-10 select-none"} style={{minHeight: "100vh"}}>
                    <Typography.Title className={"text-center"}>
                        <a onClick={() => setDarkTheme(!darkTheme)}> MCSR Analytics! </a>
                        <a title={"click to check updates"} onClick={() => setUpdateCheck(true)}>
                            <Tag color={"green"} bordered={true} className={"ml-1"}>v{version}</Tag>
                        </a>
                    </Typography.Title>
                    <Divider orientation={"left"} style={{fontSize: 21}}></Divider>
                    <RecordsTable notif={notif}/>
                </Layout>
            </Dropdown>
        </ConfigProvider>
    )
}

export default App
