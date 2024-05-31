import {createRouter, RouterProvider} from "@tanstack/react-router";
import {routeTree} from "./Pages/router.ts";
import {notification} from 'antd'

function App() {
    const router = createRouter({
        routeTree,
        context: {
            notification: notification.useNotification({
                placement: "bottomRight",
            })
        }
    })

    return (
        <RouterProvider router={router}/>
    )
}

export default App
