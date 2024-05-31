import {Outlet, useRouteContext} from "@tanstack/react-router";
import {
    App as AppProvider,
    ConfigProvider,
    Divider,
    Layout,
    Menu,
    MenuProps,
    Tag,
    theme,
    Typography
} from "antd";
import {
    UnorderedListOutlined,
} from "@ant-design/icons";
import {useEffect, useState} from "react";
import {Store} from "@tauri-apps/plugin-store";
import {PageContext} from "./router.ts";
import {getVersion} from "@tauri-apps/api/app";
import checkUpdates from "../Modules/CheckUpdates.tsx";
import ContextMenu from "../Modules/ContextMenu.tsx";

export default function PageLayout() {
    const sideMenuItems: MenuProps['items'] = [
        {
            key: '1',
            label: 'Records',
            icon: <UnorderedListOutlined/>,
        },
    ];

    const [version, setVersion] = useState('0.0.0')
    useEffect(() => {
        (async () => {
            setVersion(await getVersion())
        })()
    }, [])

    // TODO: Store theme in a global state manager
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

    const [sideMenuCollapsed, setSideMenuCollapsed] = useState(true);
    const [notif, notifContextHolder] = useRouteContext({
        from: '/',
        select: (context: PageContext) => context.notification
    })

    return (
        <ConfigProvider theme={{
            token: {
                colorBgBase: darkTheme ? "#0a0a0c" : "#ffffff",
                colorBgContainer: darkTheme ? "#0e0e11" : "#ffffff"
            },
            algorithm: darkTheme ? theme.darkAlgorithm : theme.defaultAlgorithm
        }}>
            <AppProvider>
                {notifContextHolder}
                <Layout style={{minHeight: '100vh'}}>
                    <Layout.Sider className={"main-side-bar"} collapsible collapsed={sideMenuCollapsed} theme={"light"}
                                  collapsedWidth={55}
                                  onCollapse={(value) => setSideMenuCollapsed(value)}
                                  style={{
                                      overflow: 'auto',
                                      height: '100vh',
                                      position: 'fixed',
                                      left: 0,
                                      top: 0,
                                      bottom: 0,
                                  }}
                        // This works btw, but I don't feel good about it:
                        // onMouseEnter={() => setSideMenuCollapsed(false)}
                        // onMouseLeave={() => setSideMenuCollapsed(true)}
                    >
                        <Menu mode="inline" items={sideMenuItems} defaultSelectedKeys={["1"]} style={{borderRight: 0}}/>
                    </Layout.Sider>
                    <ContextMenu>
                        <Layout className={"p-4 pt-10 select-none"} style={{
                            minHeight: "100vh",
                            marginLeft: sideMenuCollapsed ? 55 : 200,
                            transition: `all 0.2s`
                        }}>
                            <Typography.Title className={"text-center"}>
                                <a onClick={() => setDarkTheme(!darkTheme)}> MCSR Analytics! </a>
                                <a title={"click to check updates"} onClick={() => checkUpdates(notif)}>
                                    <Tag color={"green"} bordered={true} className={"ml-1"}>v{version}</Tag>
                                </a>
                            </Typography.Title>
                            <Divider orientation={"left"} style={{fontSize: 21}}/>
                            <Outlet/>
                        </Layout>
                    </ContextMenu>
                </Layout>
            </AppProvider>
        </ConfigProvider>
    )
}
