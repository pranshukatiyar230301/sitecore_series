import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { insertContactSchema, type InsertContact } from "@shared/schema";
import { useSubmitContact } from "@/hooks/use-contact";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mail, MapPin, Send, Loader2, Twitter } from "lucide-react";

export default function Contact() {
  const { toast } = useToast();
  const mutation = useSubmitContact();
  const { data: contact, isLoading } = useQuery<any>({ queryKey: ["/api/site-content", "contact"] });

  const form = useForm<InsertContact>({
    resolver: zodResolver(insertContactSchema),
    defaultValues: { name: "", email: "", message: "" },
  });

  function onSubmit(data: InsertContact) {
    mutation.mutate(data, {
      onSuccess: () => {
        toast({ title: "Message Sent!", description: "Thanks for reaching out. We'll get back to you soon." });
        form.reset();
      },
      onError: (error) => toast({ title: "Error", description: error.message, variant: "destructive" }),
    });
  }

  if (isLoading || !contact) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen pt-12 pb-24">
      <div className="bg-secondary text-secondary-foreground py-20 mb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-6 text-white">{contact.heroTitle}</h1>
          <p className="text-xl text-secondary-foreground/80 leading-relaxed max-w-2xl mx-auto">{contact.heroSubtitle}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
            <div className="space-y-12">
              <div>
                <h2 className="text-2xl font-display font-bold mb-6">{contact.infoTitle}</h2>
                <p className="text-muted-foreground leading-relaxed mb-8">{contact.infoSubtitle}</p>
                <div className="space-y-6">
                  {contact.email && (
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-full bg-primary/10 text-primary"><Mail className="h-6 w-6" /></div>
                      <div><h3 className="font-semibold">Email</h3><p className="text-muted-foreground">{contact.email}</p></div>
                    </div>
                  )}
                  {contact.twitter && (
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-full bg-primary/10 text-primary"><Twitter className="h-6 w-6" /></div>
                      <div><h3 className="font-semibold">Twitter</h3><p className="text-muted-foreground">{contact.twitter}</p></div>
                    </div>
                  )}
                  {contact.location && (
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-full bg-primary/10 text-primary"><MapPin className="h-6 w-6" /></div>
                      <div><h3 className="font-semibold">Location</h3><p className="text-muted-foreground">{contact.location}</p></div>
                    </div>
                  )}
                </div>
              </div>

              {contact.faq?.length > 0 && (
                <div className="bg-muted/30 p-8 rounded-3xl border border-border">
                  <h3 className="text-lg font-bold mb-4 font-display">FAQ</h3>
                  <div className="space-y-4">
                    {contact.faq.map((f: any, i: number) => (
                      <div key={i}>
                        <h4 className="font-semibold text-sm">{f.q}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{f.a}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-card p-8 md:p-10 rounded-3xl shadow-xl shadow-black/5 border border-border">
              <h2 className="text-2xl font-display font-bold mb-8">Send a Message</h2>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="John Doe" className="rounded-xl h-12" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="john@example.com" className="rounded-xl h-12" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="message" render={({ field }) => (
                    <FormItem><FormLabel>Message</FormLabel><FormControl><Textarea placeholder="Tell us what's on your mind..." className="min-h-[160px] rounded-xl resize-none p-4" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <Button type="submit" disabled={mutation.isPending} className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all bg-primary hover:bg-primary/90 text-white">
                    {mutation.isPending ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Sending...</> : <>Send Message <Send className="ml-2 h-4 w-4" /></>}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
