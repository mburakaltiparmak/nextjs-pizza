"use client"
 
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
 
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
 
const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
});
 
const Page = () => {

const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
     
    },
  });

const onSubmit = (data) => {
  console.log("form data : ",data);
}

  return (
    <div className="flex flex-col items-center">
      <span className="flex flex-col items-center w-[80vh]">
    <Form  {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 flex flex-col justify-between items-center gap-8">
        <FormField
          control={form.control}
          name="fullname"
          render={({ field }) => (
            <FormItem className="w-[80vh]">
              <FormLabel>İsim & Soyisim</FormLabel>
              <FormControl>
                <Input placeholder="İsminizi girin" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem className="w-[80vh]">
              <FormLabel>Adres</FormLabel>
              <FormControl>
                <Input placeholder="Adresinizi girin" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
    </span>
    <span>

    </span>
    </div>
  )
}
export default Page;