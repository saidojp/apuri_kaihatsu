"use client";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useMakeZodI18nMap } from "@/lib/zodIntl";
import { useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import NotFound from "@/components/NotFound";
import useApiQuery from "@/lib/useApiQuery";
import Post from "@/types/post";
import useApiMutation from "@/lib/useApiMutation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Pencil } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(2).max(50),
  description: z.string().min(10).max(500),
  priority: z.enum(["high", "medium", "low"]),
});

export default function EditMessagePage({
  params: { messageId },
}: {
  params: { messageId: string };
}) {
  const zodErrors = useMakeZodI18nMap();
  z.setErrorMap(zodErrors);
  const t = useTranslations("sendmessage");
  const common = useTranslations("common");
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
  const { data, isLoading, isError } = useApiQuery<{
    post: Post;
  }>(`post/${messageId}`, ["message", messageId]);
  const { mutate, isPending } = useApiMutation<{ message: string }>(
    `post/${messageId}`,
    "PUT",
    ["editMessage", messageId],
    {
      onSuccess: (data) => {
        toast({
          title: t("messageEdited"),
          description: data?.message,
        });
        form.reset();
        router.push("/messages");
      },
    }
  );

  useEffect(() => {
    if (data) {
      form.setValue("title", data.post.title);
      form.setValue("description", data.post.description);
      form.setValue("priority", data.post.priority as any);
    }
  }, [data, form]);

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

  if (isError) return <NotFound />;

  return (
    <div className="fixed inset-0 bg-background z-50 w-full h-full overflow-auto">
      <Card className="shadow-lg border-0 rounded-none min-h-screen flex flex-col">
        <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Link href="/messages" passHref>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <CardTitle className="text-2xl">{t("editMessage")}</CardTitle>
            </div>
          </div>
          <CardDescription className="text-base">
            Edit existing message
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6 flex-grow">
          <Form {...form}>
            <form
              id="edit-message-form"
              onSubmit={form.handleSubmit((values) => mutate(values as any))}
              className="space-y-6 flex flex-col h-full"
            >
              <div className="space-y-5 flex-grow">
                <h3 className="text-lg font-medium">{t("messageDetails")}</h3>

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field, formState }) => (
                    <FormItem>
                      <FormLabel className="text-base">{t("title")}</FormLabel>
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
                    <FormItem className="flex-grow">
                      <FormLabel className="text-base">
                        {t("yourMessage")}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          rows={12}
                          placeholder={t("typeMessage")}
                          {...field}
                          className="w-full resize-y min-h-[300px]"
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

              <Separator />

              <div className="flex justify-between items-center pt-4 pb-6 sticky bottom-0 bg-background">
                <Link href="/messages" passHref>
                  <Button type="button" variant="outline" size="lg">
                    {t("cancel")}
                  </Button>
                </Link>

                <Button
                  type="submit"
                  form="edit-message-form"
                  size="lg"
                  disabled={isPending || isLoading}
                  className="gap-2"
                >
                  <Pencil className="h-5 w-5" />
                  {isPending ? t("saving") : t("saveChanges")}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
