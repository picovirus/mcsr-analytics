import {ReactNode} from "react";
import {MenuProps, notification, Dropdown} from "antd";
import {
  CloudSyncOutlined,
  FullscreenOutlined,
  LogoutOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import {Window} from "@tauri-apps/api/window";
import checkUpdates from "./CheckUpdates.tsx";
import {exit} from "@tauri-apps/plugin-process";
import {useRouteContext} from "@tanstack/react-router";
import {PageContext} from "../Pages/router.ts";

export default function ContextMenu({children}: {children?: ReactNode}) {
  const [notif] = useRouteContext({
    from: "/",
    select: (context: PageContext) => context.notification,
  });

  const items: MenuProps["items"] = [
    {
      key: "1",
      label: "Reload",
      icon: <SyncOutlined />,
      onClick: () => location.reload(),
    },
    {
      key: "2",
      label: "Full screen",
      icon: <FullscreenOutlined />,
      onClick: () =>
        Window.getCurrent()
          .isFullscreen()
          .then((result) => Window.getCurrent().setFullscreen(!result)),
    },
    {
      key: "3",
      label: "Check for updates",
      icon: <CloudSyncOutlined />,
      onClick: () => checkUpdates(notif ?? notification),
    },
    {
      key: "4",
      label: "Exit",
      icon: <LogoutOutlined />,
      onClick: () => exit(),
      danger: true,
    },
  ];

  return (
    <Dropdown menu={{items}} trigger={["contextMenu"]}>
      {children}
    </Dropdown>
  );
}
