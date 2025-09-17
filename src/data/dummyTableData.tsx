import React from "react";
import Image from "next/image";
import Badge from "@/components/ui/badge/Badge";
import type { TableConfig } from "@/components/tables/ConfigurableTable";

export interface Order {
  id: number;
  user: {
    image: string;
    name: string;
    role: string;
  };
  projectName: string;
  team: {
    images: string[];
  };
  status: "Active" | "Pending" | "Cancel";
  budget: string;
}

export const orders: Order[] = [
  {
    id: 1,
    user: {
      image: "/images/user/user-17.jpg",
      name: "Lindsey Curtis",
      role: "Web Designer",
    },
    projectName: "Agency Website",
    team: {
      images: [
        "/images/user/user-22.jpg",
        "/images/user/user-23.jpg",
        "/images/user/user-24.jpg",
      ],
    },
    budget: "3.9K",
    status: "Active",
  },
  {
    id: 2,
    user: {
      image: "/images/user/user-18.jpg",
      name: "Kaiya George",
      role: "Project Manager",
    },
    projectName: "Technology",
    team: {
      images: ["/images/user/user-25.jpg", "/images/user/user-26.jpg"],
    },
    budget: "24.9K",
    status: "Pending",
  },
  {
    id: 3,
    user: {
      image: "/images/user/user-17.jpg",
      name: "Zain Geidt",
      role: "Content Writing",
    },
    projectName: "Blog Writing",
    team: {
      images: ["/images/user/user-27.jpg"],
    },
    budget: "12.7K",
    status: "Active",
  },
  {
    id: 4,
    user: {
      image: "/images/user/user-20.jpg",
      name: "Abram Schleifer",
      role: "Digital Marketer",
    },
    projectName: "Social Media",
    team: {
      images: [
        "/images/user/user-28.jpg",
        "/images/user/user-29.jpg",
        "/images/user/user-30.jpg",
      ],
    },
    budget: "2.8K",
    status: "Cancel",
  },
  {
    id: 5,
    user: {
      image: "/images/user/user-21.jpg",
      name: "Carla George",
      role: "Front-end Developer",
    },
    projectName: "Website",
    team: {
      images: [
        "/images/user/user-31.jpg",
        "/images/user/user-32.jpg",
        "/images/user/user-33.jpg",
      ],
    },
    budget: "4.5K",
    status: "Active",
  },
  {
    id: 6,
    user: {
      image: "/images/user/user-19.jpg",
      name: "Monica Bates",
      role: "Product Manager",
    },
    projectName: "Mobile App",
    team: {
      images: [
        "/images/user/user-24.jpg",
        "/images/user/user-25.jpg",
        "/images/user/user-26.jpg",
      ],
    },
    budget: "15.2K",
    status: "Pending",
  },
  {
    id: 7,
    user: {
      image: "/images/user/user-15.jpg",
      name: "Joel Rodas",
      role: "QA Engineer",
    },
    projectName: "Testing",
    team: {
      images: [
        "/images/user/user-27.jpg",
        "/images/user/user-28.jpg",
        "/images/user/user-29.jpg",
      ],
    },
    budget: "6.3K",
    status: "Active",
  },
  {
    id: 8,
    user: {
      image: "/images/user/user-16.jpg",
      name: "Alexa Hoover",
      role: "UX Researcher",
    },
    projectName: "User Interviews",
    team: {
      images: [
        "/images/user/user-22.jpg",
        "/images/user/user-24.jpg",
        "/images/user/user-30.jpg",
      ],
    },
    budget: "8.1K",
    status: "Active",
  },
];

const statusColorMap: Record<Order["status"], "success" | "warning" | "error"> = {
  Active: "success",
  Pending: "warning",
  Cancel: "error",
};

const handleEditOrder = (order: Order) => {
  console.log(`Edit order ${order.id}`);
};

const handleRemoveOrder = (order: Order) => {
  console.log(`Remove order ${order.id}`);
};

export const orderTableConfig: TableConfig<Order> = {
  name: "Games",
  enablePagination: true,
  enableSearch: true,
  enableSorting: true,
  defaultItemsPerPage: 5,
  itemsPerPageOptions: [5, 10, 20],
  getRowKey: (row) => row.id,
  actions: {
    align: "end",
    edit: {
      onClick: handleEditOrder,
    },
    remove: {
      onClick: handleRemoveOrder,
    },
  },
  fields: [
    {
      key: "user",
      label: "User",
      sortable: true,
      searchAccessor: (row) => `${row.user.name} ${row.user.role}`,
      sortAccessor: (row) => row.user.name.toLowerCase(),
      headerClassName: "px-5",
      cellClassName: "px-5 sm:px-6 text-start",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-full">
            <Image
              width={40}
              height={40}
              src={row.user.image}
              alt={row.user.name}
            />
          </div>
          <div>
            <span className="block font-medium text-theme-sm text-gray-800 dark:text-white/90">
              {row.user.name}
            </span>
            <span className="block text-theme-xs text-gray-500 dark:text-gray-400">
              {row.user.role}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "projectName",
      label: "Project Name",
      dataKey: "projectName",
      sortable: true,
      headerClassName: "text-start",
      cellClassName: "text-start",
    },
    {
      key: "team",
      label: "Team",
      headerClassName: "text-start",
      cellClassName: "text-start",
      searchAccessor: (row) => row.team.images.join(" "),
      render: (row) => (
        <div className="flex -space-x-2">
          {row.team.images.map((teamImage, index) => (
            <div
              key={teamImage}
              className="h-6 w-6 overflow-hidden rounded-full border-2 border-white dark:border-gray-900"
            >
              <Image
                width={24}
                height={24}
                src={teamImage}
                alt={`Team member ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      dataKey: "status",
      sortable: true,
      align: "center",
      cellClassName: "text-center",
      headerClassName: "text-center",
      render: (row) => (
        <Badge size="sm" color={statusColorMap[row.status]}>
          {row.status}
        </Badge>
      ),
    },
    {
      key: "budget",
      label: "Budget",
      dataKey: "budget",
      sortable: true,
      align: "end",
      cellClassName: "text-right",
      headerClassName: "text-right",
    },
  ],
};
