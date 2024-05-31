import { NotificationInstance } from "antd/lib/notification/interface";
import {info} from "@tauri-apps/plugin-log";
import {check} from "@tauri-apps/plugin-updater";
import {Modal, Button} from "antd";
import {InfoCircleFilled} from "@ant-design/icons";
import {relaunch} from "@tauri-apps/plugin-process";

// TODO: use static methods for notification while still using config provider's theme and color settings
// TODO: check if we're already checking for updates or not
export default async function checkUpdates(notif: NotificationInstance) {
    notif.info({
        message: "Checking for new updates",
        description: "Please wait for me fetch updates from github...",
    });

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
            notif.success({
                message: "You are already up to date",
            });
        }
    } catch (e) {
        await info(String(e))
        notif.error({
            message: "Update check failed!",
            description: String(e),
            btn: <Button onClick={() => checkUpdates(notif)}>Retry</Button>,
        });
    }
}
