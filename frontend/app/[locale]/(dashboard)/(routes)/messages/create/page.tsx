"use client";
import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Group from "@/types/group";
import { GroupTable } from "@/components/GroupTable";
import Student from "@/types/student";
import { StudentTable } from "@/components/StudentTable";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useRouter } from "@/navigation";
import ImageFile from "@/types/ImageFile";
import { useMakeZodI18nMap } from "@/lib/zodIntl";
import { toast } from "@/components/ui/use-toast";
import useApiMutation from "@/lib/useApiMutation";
import Post from "@/types/post";
import {
  AlertCircle,
  ArrowLeft,
  Send,
  Users,
  UserRound,
  X,
} from "lucide-react";

const formSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  priority: z.enum(["high", "medium", "low"]),
});

export default function SendMessagePage() {
  const zodErrors = useMakeZodI18nMap();
  z.setErrorMap(zodErrors);
  const t = useTranslations("sendmessage");
  const tName = useTranslations("names");
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<Group[]>([]);
  const formRef = React.useRef<HTMLFormElement>(null);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "low",
    },
  });
  const formValues = useWatch({ control: form.control });
  const router = useRouter();
  const { mutate, isPending } = useApiMutation<{ post: Post }>(
    `post/create`,
    "POST",
    ["sendMessage"],
    {
      onSuccess: (data) => {
        toast({
          title: t("messageSent"),
          description: data.post.title,
        });
        form.reset();
        setSelectedStudents([]);
        setSelectedGroups([]);
        router.push("/messages");
      },
    }
  );

  useEffect(() => {
    const savedFormData = localStorage.getItem("formData");
    const parsedFormData = savedFormData && JSON.parse(savedFormData);
    if (parsedFormData) {
      form.setValue("title", parsedFormData.title);
      form.setValue("description", parsedFormData.description);
      form.setValue("priority", parsedFormData.priority);
    }

    const subscription = form.watch((values) => {
      localStorage.setItem("formData", JSON.stringify(values));
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Helper function to get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      case "medium":
        return "bg-amber-100 text-amber-800 hover:bg-amber-200";
      case "low":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      default:
        return "bg-slate-100 text-slate-800 hover:bg-slate-200";
    }
  };

  // Remove a student from selection
  const removeStudent = (studentId: number) => {
    setSelectedStudents((prev) =>
      prev.filter((student) => student.id !== studentId)
    );
  };

  // Remove a group from selection
  const removeGroup = (groupId: number) => {
    setSelectedGroups((prev) => prev.filter((group) => group.id !== groupId));
  };

  return (
    <div className="w-full h-full">
      <Card className="shadow-lg border-0 rounded-none h-full">
        <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Link href="/messages" passHref>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <CardTitle className="text-2xl">{t("sendMessage")}</CardTitle>
            </div>
          </div>
          <CardDescription className="text-base">
            {t("createNewMessage")}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) =>
                mutate({
                  ...data,
                  students: selectedStudents.map((student) => student.id),
                  groups: selectedGroups.map((group) => group.id),
                } as any)
              )}
              ref={formRef}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-5">
                  <h3 className="text-lg font-medium">{t("messageDetails")}</h3>

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field, formState }) => (
                      <FormItem>
                        <FormLabel className="text-base">
                          {t("title")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={t("typeTitle")}
                            className="w-full"
                          />
                        </FormControl>
                        <FormMessage>
                          {formState.errors.title && t("titleRequired")}
                        </FormMessage>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field, formState }) => (
                      <FormItem>
                        <FormLabel className="text-base">
                          {t("yourMessage")}
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            rows={8}
                            placeholder={t("typeMessage")}
                            {...field}
                            className="w-full resize-y min-h-[200px]"
                          />
                        </FormControl>
                        <FormMessage>
                          {formState.errors.description && t("messageRequired")}
                        </FormMessage>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field, formState }) => (
                      <FormItem>
                        <FormLabel className="text-base">
                          {t("choosePriority")}
                        </FormLabel>
                        <div className="flex gap-3 w-full">
                          <Button
                            type="button"
                            className={`flex-1 ${
                              field.value === "low"
                                ? getPriorityColor("low")
                                : "bg-slate-100 hover:bg-slate-200"
                            }`}
                            variant="outline"
                            onClick={() => form.setValue("priority", "low")}
                          >
                            {t("low")}
                          </Button>
                          <Button
                            type="button"
                            className={`flex-1 ${
                              field.value === "medium"
                                ? getPriorityColor("medium")
                                : "bg-slate-100 hover:bg-slate-200"
                            }`}
                            variant="outline"
                            onClick={() => form.setValue("priority", "medium")}
                          >
                            {t("medium")}
                          </Button>
                          <Button
                            type="button"
                            className={`flex-1 ${
                              field.value === "high"
                                ? getPriorityColor("high")
                                : "bg-slate-100 hover:bg-slate-200"
                            }`}
                            variant="outline"
                            onClick={() => form.setValue("priority", "high")}
                          >
                            {t("high")}
                          </Button>
                        </div>
                        <FormMessage>
                          {formState.errors.priority && t("priorityRequired")}
                        </FormMessage>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-5">
                  <h3 className="text-lg font-medium">{t("recipients")}</h3>

                  <div className="space-y-4">
                    {selectedGroups.length > 0 && (
                      <div className="w-full">
                        <span className="text-sm font-medium flex items-center gap-1 mb-2">
                          <Users className="h-4 w-4" /> {t("groups")} (
                          {selectedGroups.length})
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {selectedGroups.map((group) => (
                            <Badge
                              key={group.id}
                              variant="secondary"
                              className="text-sm px-2 py-1 flex items-center gap-1"
                            >
                              <span className="truncate max-w-[150px]">
                                {group?.name}
                              </span>
                              <button
                                onClick={() => removeGroup(group.id)}
                                className="ml-1 hover:text-red-500"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedStudents.length > 0 && (
                      <div className="w-full mt-3">
                        <span className="text-sm font-medium flex items-center gap-1 mb-2">
                          <UserRound className="h-4 w-4" /> {t("students")} (
                          {selectedStudents.length})
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {selectedStudents.map((student) => (
                            <Badge
                              key={student.id}
                              variant="secondary"
                              className="text-sm px-2 py-1 flex items-center gap-1"
                            >
                              <span className="truncate max-w-[150px]">
                                {tName("name", { ...student, parents: "" })}
                              </span>
                              <button
                                onClick={() => removeStudent(student.id)}
                                className="ml-1 hover:text-red-500"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="bg-white dark:bg-slate-800 border rounded-md overflow-hidden mt-4">
                      <Tabs defaultValue="group">
                        <TabsList className="grid w-full grid-cols-2 bg-slate-100 dark:bg-slate-900 rounded-none">
                          <TabsTrigger value="group" className="rounded-none">
                            <Users className="h-4 w-4 mr-2" />
                            {t("groups")}
                          </TabsTrigger>
                          <TabsTrigger value="student" className="rounded-none">
                            <UserRound className="h-4 w-4 mr-2" />
                            {t("students")}
                          </TabsTrigger>
                        </TabsList>
                        <div className="h-[350px] overflow-y-auto">
                          <TabsContent value="group" className="m-0 p-0 h-full">
                            <GroupTable
                              selectedGroups={selectedGroups}
                              setSelectedGroups={setSelectedGroups}
                            />
                          </TabsContent>
                          <TabsContent
                            value="student"
                            className="m-0 p-0 h-full"
                          >
                            <StudentTable
                              selectedStudents={selectedStudents}
                              setSelectedStudents={setSelectedStudents}
                            />
                          </TabsContent>
                        </div>
                      </Tabs>
                    </div>
                  </div>
                </div>
              </div>

              {selectedGroups.length === 0 && selectedStudents.length === 0 && (
                <div className="flex items-center bg-amber-50 dark:bg-amber-950 p-4 rounded-md text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                  <span className="text-base">{t("noRecipientsWarning")}</span>
                </div>
              )}

              <Separator />

              <div className="flex justify-between items-center pt-2">
                <Link href="/messages" passHref>
                  <Button type="button" variant="outline" size="lg">
                    {t("cancel")}
                  </Button>
                </Link>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      size="lg"
                      disabled={
                        isPending ||
                        (selectedGroups.length === 0 &&
                          selectedStudents.length === 0)
                      }
                      className="gap-2"
                    >
                      <Send className="h-5 w-5" />
                      {isPending ? `${t("sendMessage")}...` : t("sendMessage")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[700px]">
                    <DialogHeader>
                      <DialogTitle className="text-xl">
                        {t("preview")}
                      </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-5 py-4">
                      <div className="space-y-3">
                        <h3 className="text-xl font-medium">
                          {formValues.title}
                        </h3>
                        <p className="text-base whitespace-pre-wrap">
                          {formValues.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 mt-4">
                        <Badge
                          className={`text-base px-3 py-1 ${getPriorityColor(
                            String(formValues.priority || "low")
                          )}`}
                        >
                          {t("priority")}:{" "}
                          {formValues.priority
                            ? t(String(formValues.priority))
                            : t("low")}
                        </Badge>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {selectedGroups.length > 0 && (
                          <div>
                            <h4 className="text-base font-medium mb-3 flex items-center gap-1">
                              <Users className="h-5 w-5" /> {t("groups")} (
                              {selectedGroups.length})
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {selectedGroups.map((group) => (
                                <Badge
                                  key={group.id}
                                  variant="secondary"
                                  className="text-sm px-2 py-1"
                                >
                                  {group?.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedStudents.length > 0 && (
                          <div>
                            <h4 className="text-base font-medium mb-3 flex items-center gap-1">
                              <UserRound className="h-5 w-5" /> {t("students")}{" "}
                              ({selectedStudents.length})
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {selectedStudents.map((student) => (
                                <Badge
                                  key={student.id}
                                  variant="secondary"
                                  className="text-sm px-2 py-1"
                                >
                                  {tName("name", { ...student, parents: "" })}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                      <DialogClose asChild>
                        <Button type="button" variant="outline" size="lg">
                          {t("edit")}
                        </Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button
                          size="lg"
                          onClick={() => {
                            if (formRef.current) {
                              formRef.current.dispatchEvent(
                                new Event("submit", { bubbles: true })
                              );
                            }
                          }}
                          className="gap-2"
                        >
                          <Send className="h-5 w-5" />
                          {t("confirm")}
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
