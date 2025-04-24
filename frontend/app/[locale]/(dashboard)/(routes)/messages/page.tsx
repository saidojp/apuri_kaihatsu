"use client";
import { useTranslations } from "next-intl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  EllipsisVertical,
  Plus,
  MessageSquare,
  Search,
  Edit,
  Trash2,
  AlertCircle,
  Clock,
  Eye,
  Save
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import PaginationApi from "@/components/PaginationApi";
import { Input } from "@/components/ui/input";
import { Link, usePathname, useRouter } from "@/navigation";
import { Button } from "@/components/ui/button";
import PostApi from "@/types/postApi";
import Post from "@/types/post";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";
import TableApi from "@/components/TableApi";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import useApiQuery from "@/lib/useApiQuery";
import useApiMutation from "@/lib/useApiMutation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

export default function Info() {
  const t = useTranslations("posts");
  const tSend = useTranslations("sendmessage");
  const tName = useTranslations("names");
  const [page, setPage] = useState(1);
  const [scheduledPage, setScheduledPage] = useState(1);
  const [search, setSearch] = useState("");
  const [scheduledSearch, setScheduledSearch] = useState("");
  const [activeTab, setActiveTab] = useState("sent"); // "sent" or "scheduled"
  const { data } = useApiQuery<PostApi>(
    `post/list?page=${page}&text=${search}`,
    ["posts", page, search]
  );
  const { data: scheduledData } = useApiQuery<PostApi>(
    `post/scheduled?page=${scheduledPage}&text=${scheduledSearch}`,
    ["scheduled-posts", scheduledPage, scheduledSearch]
  );
  const pathName = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [postId, setPostId] = useState<number | null>(null);
  const [deletingRows, setDeletingRows] = useState<number[]>([]);

  const { mutate } = useApiMutation<{ message: string }>(
    `post/${postId}`,
    "DELETE",
    ["deletePost"],
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ["posts"] });
        queryClient.invalidateQueries({ queryKey: ["scheduled-posts"] });

        // Set a timeout to remove the row from the deleting state
        setTimeout(() => {
          setDeletingRows((current) => current.filter((id) => id !== postId));
        }, 500);

        toast({
          title: t("postDeleted"),
          description: data?.message,
          variant: "destructive",
        });
      },
    }
  );

  // Function to get priority color and styling based on priority level
  const getPriorityBadge = (priority: string) => {
    const priorityLower = priority.toLowerCase();
    if (priorityLower.includes("high")) {
      return (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 border-red-200 whitespace-nowrap"
        >
          <AlertCircle className="h-3.5 w-3.5 mr-1" /> {priority}
        </Badge>
      );
    } else if (priorityLower.includes("medium")) {
      return (
        <Badge
          variant="outline"
          className="bg-amber-50 text-amber-700 border-amber-200 whitespace-nowrap"
        >
          <Clock className="h-3.5 w-3.5 mr-1" /> {priority}
        </Badge>
      );
    } else if (priorityLower.includes("low")) {
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200 whitespace-nowrap"
        >
          <Eye className="h-3.5 w-3.5 mr-1" /> {priority}
        </Badge>
      );
    }
    return <Badge variant="outline">{priority}</Badge>;
  };

  // Function to truncate long text
  const truncateText = (text: string, maxLength: number = 60) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  const postColumns: ColumnDef<Post>[] = [
    {
      accessorKey: "title",
      header: t("postTitle"),
      cell: ({ row }) => (
        <Link
          href={`messages/${row.original.id}`}
          className="font-medium text-primary hover:text-primary/80 transition-colors"
        >
          {row.getValue("title")}
        </Link>
      ),
    },
    {
      accessorKey: "description",
      header: t("Description"),
      cell: ({ row }) => (
        <Link
          href={`messages/${row.original.id}`}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          {truncateText(row.getValue("description") as string)}
        </Link>
      ),
    },
    {
      accessorKey: "admin_name",
      header: t("Admin_name"),
      cell: ({ row }) => (
        <Link
          href={`messages/${row.original.id}`}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          {tName("name", { ...row?.original?.admin })}
        </Link>
      ),
    },
    {
      accessorKey: "priority",
      header: t("Priority"),
      cell: ({ row }) => {
        const priority = row.getValue("priority") as string;
        return (
          <Link href={`messages/${row.original.id}`}>
            {getPriorityBadge(priority)}
          </Link>
        );
      },
    },
    {
      accessorKey: "read_percent",
      header: t("Read_percent"),
      cell: ({ row }) => {
        const percent = row.getValue("read_percent") as number;
        return (
          <Link
            href={`messages/${row.original.id}`}
            className="flex items-center"
          >
            <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 dark:bg-gray-700 w-16">
              <div
                className="bg-primary h-2.5 rounded-full"
                style={{ width: `${percent}%` }}
              ></div>
            </div>
            <span className="text-sm">{percent}%</span>
          </Link>
        );
      },
    },
    {
      header: t("action"),
      cell: ({ row }) => (
        <Dialog>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                <EllipsisVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => router.push(`${pathName}/${row.original.id}`)}
                className="gap-2"
              >
                <Eye className="h-4 w-4" />
                {t("view")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  router.push(`${pathName}/edit/${row.original.id}`)
                }
                className="gap-2"
              >
                <Edit className="h-4 w-4" />
                {t("edit")}
              </DropdownMenuItem>
              <DropdownMenuItem
                asChild
                className="gap-2 text-red-600 focus:text-red-600"
              >
                <DialogTrigger className="w-full flex items-center">
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t("delete")}
                </DialogTrigger>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-lg">
                {row.getValue("title")}
              </DialogTitle>
              <DialogDescription className="mt-2 text-gray-500">
                {truncateText(row.getValue("description") as string, 120)}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-center text-muted-foreground">
                {t("doYouDeleteMessage")}
              </p>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <DialogClose asChild>
                <Button variant="secondary">{t("cancel")}</Button>
              </DialogClose>
              <Button
                type="submit"
                variant="destructive"
                onClick={() => {
                  const id = row.original.id;
                  setPostId(id);
                  setDeletingRows((current) => [...current, id]);
                  mutate();
                }}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {t("delete")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ),
    },
  ];

  // Add column for scheduled delivery time
  const scheduledPostColumns: ColumnDef<Post>[] = [
    ...postColumns.slice(0, postColumns.length - 1),
    {
      accessorKey: "delivery_at",
      header: tSend("delivery_at"),
      cell: ({ row }) => {
        const deliveryDate = row.original.delivery_at 
          ? new Date(row.original.delivery_at) 
          : null;
        
        return deliveryDate ? (
          <Link
            href={`messages/${row.original.id}`}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {format(deliveryDate, "PPP p")}
          </Link>
        ) : null;
      },
    },
    postColumns[postColumns.length - 1], // Add the action column at the end
  ];

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-semibold">{t("posts")}</h1>
        </div>
        <div className="flex items-center space-x-3">
          <Link href={`${pathName}/create`} passHref>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              {t("createpost")}
            </Button>
          </Link>
          <Link href={`${pathName}/drafts`} passHref>
            <Button variant="outline" className="gap-2">
              <Save className="h-4 w-4" />
              {tSend("viewDrafts")}
            </Button>
          </Link>
        </div>
      </div>

      <Tabs
        defaultValue="sent"
        value={activeTab}
        onValueChange={(value) => setActiveTab(value)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="sent">{t("posts")}</TabsTrigger>
          <TabsTrigger value="scheduled">{tSend("scheduledMessages")}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sent" className="mt-0">
          <Card className="border shadow-sm">
            <CardHeader className="pb-3 border-b">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("filter")}
                    onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="pl-9"
                  />
                </div>
                <PaginationApi data={data?.pagination ?? null} setPage={setPage} />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <TableApi
                data={data?.posts ?? null}
                columns={postColumns}
                deletingRows={deletingRows}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="mt-0">
          <Card className="border shadow-sm">
            <CardHeader className="pb-3 border-b">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("filter")}
                    onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setScheduledSearch(e.target.value);
                      setScheduledPage(1);
                    }}
                    className="pl-9"
                  />
                </div>
                <PaginationApi 
                  data={scheduledData?.pagination ?? null} 
                  setPage={setScheduledPage} 
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <TableApi
                data={scheduledData?.posts ?? null}
                columns={scheduledPostColumns}
                deletingRows={deletingRows}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
