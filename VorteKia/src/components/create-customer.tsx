// import { Toaster, toast } from "sonner";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//     Select,
//     SelectContent,
//     SelectGroup,
//     SelectItem,
//     SelectLabel,
//     SelectTrigger,
//     SelectValue,
// } from "@/components/ui/select";
// import {
//     Dialog,
//     DialogContent,
//     DialogDescription,
//     DialogFooter,
//     DialogHeader,
//     DialogTitle,
//     DialogTrigger,
// } from "@/components/ui/dialog";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import {
//     Form,
//     FormControl,
//     FormField,
//     FormItem,
//     FormLabel,
//     FormMessage,
// } from "@/components/ui/form";
// import { Division } from "@/types";
// import { useEffect, useState } from "react";
// import {
//     createStaffPromise,
//     getDivisions,
//     StaffFormSchema,
// } from "@/controllers/register-controller";

// export default function CreateCustomer() {
//     const form = useForm<z.infer<typeof CreateCustomerFormSchema>>({
//         resolver: zodResolver(StaffFormSchema),
//     });

//     async function createStaffAccount(data: z.infer<typeof CreateCustomerFormSchema>) {
//         try {
//             const response = createStaffPromise(data);

//             toast.promise(response, {
//                 loading: "Creating account...",
//                 success: () => {
//                     return "Successfully created staff account!";
//                 },
//                 error: (error) =>
//                     `Failed creating account: ${error.message || error}`,
//             });
//         } catch (error) {
//             toast.error("Failed creating account!", {
//                 description: "An error occured: " + error,
//                 action: {
//                     label: "Close",
//                     onClick: () => {},
//                 },
//             });
//         }
//     }

//     return (
//         <>
//             <Dialog>
//                 <Toaster position="bottom-right" richColors={true} />
//                 <DialogTrigger asChild>
//                     <Button variant="ghost">Create Staff Account</Button>
//                 </DialogTrigger>
//                 <DialogContent className="">
//                     <Form {...form}>
//                         <form
//                             onSubmit={form.handleSubmit(createStaffAccount)}
//                             className="space-y-6">
//                             <DialogHeader>
//                                 <DialogTitle>Create Staff Account</DialogTitle>
//                                 <DialogDescription>
//                                     Consult Division Leaders Before Creating
//                                     Staff Accounts.
//                                 </DialogDescription>
//                             </DialogHeader>
//                             <FormField
//                                 control={form.control}
//                                 name="email"
//                                 render={({ field }) => (
//                                     <FormItem>
//                                         <FormLabel>Email</FormLabel>
//                                         <FormControl>
//                                             <Input
//                                                 placeholder="email"
//                                                 {...field}
//                                             />
//                                         </FormControl>
//                                         <FormMessage />
//                                     </FormItem>
//                                 )}
//                             />
//                             <FormField
//                                 control={form.control}
//                                 name="password"
//                                 render={({ field }) => (
//                                     <FormItem>
//                                         <FormLabel>Password</FormLabel>
//                                         <FormControl>
//                                             <Input
//                                                 placeholder="password"
//                                                 type="password"
//                                                 {...field}
//                                             />
//                                         </FormControl>
//                                         <FormMessage />
//                                     </FormItem>
//                                 )}
//                             />
//                             <FormField
//                                 control={form.control}
//                                 name="name"
//                                 render={({ field }) => (
//                                     <FormItem>
//                                         <FormLabel>Name</FormLabel>
//                                         <FormControl>
//                                             <Input
//                                                 placeholder="name"
//                                                 {...field}
//                                             />
//                                         </FormControl>
//                                         <FormMessage />
//                                     </FormItem>
//                                 )}
//                             />
//                             <FormField
//                                 control={form.control}
//                                 name="division_id"
//                                 render={({ field }) => (
//                                     <FormItem>
//                                         <FormLabel>Division</FormLabel>
//                                         <Select
//                                             onValueChange={field.onChange}
//                                             defaultValue={field.value}
//                                             required>
//                                             <SelectTrigger>
//                                                 <SelectValue placeholder="Staff Division" />
//                                             </SelectTrigger>
//                                             <SelectContent>
//                                                 <SelectGroup>
//                                                     <SelectLabel>
//                                                         Division
//                                                     </SelectLabel>
//                                                     {divisions &&
//                                                         divisions.map((div) => (
//                                                             <SelectItem
//                                                                 key={
//                                                                     div.division_id
//                                                                 }
//                                                                 value={
//                                                                     div.division_id
//                                                                 }>
//                                                                 {
//                                                                     div.division_name
//                                                                 }
//                                                             </SelectItem>
//                                                         ))}
//                                                 </SelectGroup>
//                                             </SelectContent>
//                                         </Select>
//                                         <FormMessage />
//                                     </FormItem>
//                                 )}
//                             />
//                             <FormField
//                                 control={form.control}
//                                 name="role"
//                                 render={({ field }) => (
//                                     <FormItem>
//                                         <FormLabel>Role</FormLabel>
//                                         <Select
//                                             onValueChange={field.onChange}
//                                             defaultValue={field.value}
//                                             required>
//                                             <SelectTrigger>
//                                                 <SelectValue placeholder="Staff Role" />
//                                             </SelectTrigger>
//                                             <SelectContent>
//                                                 <SelectGroup>
//                                                     <SelectLabel>
//                                                         Role
//                                                     </SelectLabel>
//                                                     <SelectItem
//                                                         key="manager"
//                                                         value="manager">
//                                                         Manager
//                                                     </SelectItem>
//                                                     <SelectItem
//                                                         key="staff"
//                                                         value="staff">
//                                                         Staff
//                                                     </SelectItem>
//                                                     <SelectItem
//                                                         key="chef"
//                                                         value="chef">
//                                                         Chef
//                                                     </SelectItem>
//                                                     <SelectItem
//                                                         key="waiter"
//                                                         value="waiter">
//                                                         Waiter
//                                                     </SelectItem>
//                                                     <SelectItem
//                                                         key="supervisor"
//                                                         value="supervisor">
//                                                         Supervisor
//                                                     </SelectItem>
//                                                 </SelectGroup>
//                                             </SelectContent>
//                                         </Select>
//                                         <FormMessage />
//                                     </FormItem>
//                                 )}
//                             />
//                             <DialogFooter>
//                                 <Button type="submit">Create Account</Button>
//                             </DialogFooter>
//                         </form>
//                     </Form>
//                 </DialogContent>
//             </Dialog>
//         </>
//     );
// }
