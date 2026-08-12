import {
    LayoutDashboard,
    Users,
    Building2,
    AlertTriangle,
} from "lucide-react";

export const menuItems = [
    {
        id: "dashboard",
        label: "Dashboard",
        path: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        id: "master-data",
        label: "Master Data",
        icon: Users,
        children: [
            {
                id: "roles",
                label: "Roles",
                path: "/roles",
            },
        ]
    },
    {
        id: "user-management",
        label: "User Management",
        icon: Users,
        children: [
            {
                id: "employees",
                label: "Add User",
                path: "/employees",
            },
        ],
    },
    {
        id: "building-management",
        label: "Building Management",
        icon: Building2,
        children: [
            {
                id: "terminals",
                label: "Terminals",
                path: "/terminals",
            },
            {
                id: "blocks",
                label: "Blocks",
                path: "/blocks",
            },
            {
                id: "floors",
                label: "Floors",
                path: "/floors",
            },
            {
                id: "rooms",
                label: "Rooms",
                path: "/rooms",
            },
            {
                id: "rooms-availability",
                label: "Rooms Availability",
                path: "/rooms-availability",
            },
        ],
    },
    {
        id: "incident-management",
        label: "Incident Management",
        icon: AlertTriangle,
        children: [
            {
                id: "incident-dashboard",
                label: "Incidents Dashboard",
                path: "/incident/dashboard",
            },
            {
                id: "add-incident",
                label: "Add Incident",
                path: "/incident/add-incident",
            },
            {
                id: "room-allocation",
                label: "Room Allocation",
                path: "/incident/room-allocation",
            },
            {
                id: "incidents-closure",
                label: "Incidents Closure",
                path: "/incident/investigation",
            },
            {
                id: "post-incident-review",
                label: "Post Incident Review",
                path: "/incident/post-incident-review",
            },
        ],
    },
];