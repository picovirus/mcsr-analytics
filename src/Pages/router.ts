import useNotification from "antd/lib/notification/useNotification";
import {createRootRouteWithContext, createRoute} from '@tanstack/react-router'
import PageLayout from "./PageLayout.tsx";
import RecordsTable from "./RecordsTable.tsx";

export interface PageContext {
    notification: ReturnType<typeof useNotification>
}

export const rootRoute = createRootRouteWithContext<PageContext>()({
    component: PageLayout,
})

const mainRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: RecordsTable,
})

export const routeTree = rootRoute.addChildren([
    mainRoute
])
