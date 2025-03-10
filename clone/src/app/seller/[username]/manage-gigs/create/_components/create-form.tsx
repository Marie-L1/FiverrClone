"use client";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
// import { api } from "@/convex/_generated/api";
import { toast } from "react-hot-toast";
import { useQuery } from "convex/react";
import { use, useState } from "react";
import { Doc, id } from "@/convex/_generated/dataModel";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Doc } from "../../../../../../../convex/_generated/dataModel";
import { title } from "process";


interface CreateFormProps {
    username: string;
}

const CreateFormSchema = z.object({
    title: z.string().min(20, {
        message: "Title must be at least 20 characters.",
    }).max(100, {
        message: "Title must be at most 100 characters.",
    }),
    category: z.string({
        required_error: "Please select a category.",
    }),
    subcategoryId: z.string({
        required_error: "Please select a subcategory.",
    })
});

type CreateFormValues = z.infer<typeof CreateFormSchema>;

const defaultValues: Partial<CreateFormValues> = {
    title: "",
}

export const CreateForm = ({username}: CreateFormProps) => {
    const categories = useQuery(api.categories.get);
    // subcategories will be a table in the db - getting the types
    const [subcategories, setSubcategories] = useState<Doc<"subcategories">[]>([]);
    const { mutate, pending} = useApiMutation(api.gig.create);
    const router = useRouter();
    // not using axios, checking if data is correct before sending it to the db
    const form = useForm<CreateFormValues>({
        resolver: zodResolver(CreateFormSchema),
        defaultValues,
        mode: "onChange",
    })

    // selecting category by name
    function handleCategoryChange(categoryName: string) { 
        if (categories === undefined) return;
        const selectedCategory = categories.find(category => 
            category.name === categoryName);
        // each category will have a its own subcategories
        if (selectedCategory) {
            setSubcategories(selectedCategory.subcategories);
        }
    }
    
    function onSubmit(data: CreateFormValues) {
        mutate({
            title: data.title,
            description: "",
            subcategoryId: data.subcategoryId,
        })
        .then((gigId: Id<"gigs">) => {
            toast.info("Gig created successfully!");
            // form.setValue("title", "");
            router.push(`/seller/${username}/manage-gigs/edit/${gigId}`);
        })
        .catch(() => {
            toast.error("Failed to create gig.");
        })
    }
    return (
        <Form {...form}>
            <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                    control={form.control} 
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                                <Input placeholder="Title" {...field} />
                            </FormControl>
                            <FormDescription>
                                Craft a catchy Gig title to attract potential buyers.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select
                                onValueChange={(categoryName: string) => {
                                    field.onChange(categoryName);
                                    handleCategoryChange(categoryName);
                                }}
                                defaultValue={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                </FormControl>
                                {categories && (
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem key={category._id} value={category.name}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                )}
                            </Select>
                            <FormDescription>
                                Select a category most relevant to your gig.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField 
                control={form.control}
                name="subcategoryId"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Subcategory</FormLabel>
                        <Select onValueChange={field.onChange}>
                            defaultValue={field.value}
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a subcategory" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {subcategories.map((subcategory, index) => (
                                    <SelectItem key={index} value={subcategory._id}> 
                                        {subcategory.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormDescription>
                            Select a subcategory to help buyers pinpoint your service.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
                />
                <Button type="submit" disabled={pending}>Save</Button>
            </form>
        </Form>
    );
    
 }