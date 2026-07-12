import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useCreateTicket, useListTickets } from "@workspace/api-client-react";
import { useAuth } from "@clerk/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, MapPin, Phone, MessageSquare, Clock, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/format";

const contactSchema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(20, "Message must be at least 20 characters"),
});

export default function Contact() {
  const { isSignedIn } = useAuth();
  const { toast } = useToast();
  const createTicket = useCreateTicket();
  
  // Only fetch tickets if signed in
  const { data: tickets, refetch } = useListTickets({ query: { enabled: !!isSignedIn } as any });

  const form = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: { subject: "", message: "" }
  });

  const onSubmit = async (data: any) => {
    if (!isSignedIn) {
      toast({
        title: "Sign in required",
        description: "Please sign in to send a support ticket.",
        variant: "destructive"
      });
      return;
    }

    try {
      await createTicket.mutateAsync({ data });
      toast({
        title: "Message Sent",
        description: "We have received your message and will respond shortly.",
      });
      form.reset();
      refetch();
    } catch (error: any) {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader 
        title="Contact Support" 
        description="Need help with an application or have a general query? We're here for you."
      />

      <div className="container mx-auto px-4 py-16 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-8">
            <div>
              <h2 className="text-2xl font-bold font-serif text-secondary mb-6">Get in Touch</h2>
              <p className="text-muted-foreground mb-8">
                Visit our physical center or reach out to us digitally. Our support team responds to tickets within 24 hours.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-secondary">Physical Center</h3>
                  <p className="text-sm text-muted-foreground mt-1">123 Digital Seva Road<br/>Patna, Bihar 800001</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-secondary">Phone Support</h3>
                  <p className="text-sm text-muted-foreground mt-1">+91 1800 123 4567<br/>Mon-Sat: 9AM to 6PM</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-secondary">Email us</h3>
                  <p className="text-sm text-muted-foreground mt-1">support@biharcyber.gov.in</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form & Ticket History */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl overflow-hidden mb-12">
              <div className="bg-primary/5 p-6 border-b border-primary/10">
                <h3 className="text-xl font-bold text-secondary flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" /> Send a Message
                </h3>
              </div>
              <CardContent className="p-8">
                {!isSignedIn && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl mb-6 text-sm">
                    You need to be signed in to submit a support ticket. 
                  </div>
                )}
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <FormControl>
                            <Input placeholder="What is this regarding?" {...field} disabled={!isSignedIn || createTicket.isPending} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Please describe your issue in detail..." 
                              className="min-h-[150px]"
                              {...field} 
                              disabled={!isSignedIn || createTicket.isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={!isSignedIn || createTicket.isPending}>
                      {createTicket.isPending ? "Sending..." : "Submit Ticket"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {isSignedIn && tickets && tickets.length > 0 && (
              <div>
                <h3 className="text-xl font-bold font-serif text-secondary mb-6">Your Previous Tickets</h3>
                <div className="space-y-4">
                  {tickets.map(ticket => (
                    <Card key={ticket.id} className="overflow-hidden border shadow-sm">
                      <div className="p-4 sm:p-6 bg-card">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-secondary">{ticket.subject}</h4>
                          <Badge variant={ticket.status === 'resolved' ? 'success' : ticket.status === 'in_progress' ? 'warning' : 'outline'} className="ml-2 shrink-0">
                            {ticket.status.replace("_", " ")}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {formatDateTime(ticket.createdAt)}
                        </p>
                        <p className="text-sm text-secondary-foreground/80 mb-4 bg-muted/50 p-3 rounded-lg">{ticket.message}</p>
                        
                        {ticket.adminReply && (
                          <div className="mt-4 bg-primary/5 border border-primary/20 p-4 rounded-xl relative">
                            <span className="absolute -top-3 left-4 bg-background px-2 text-xs font-bold text-primary flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Support Reply
                            </span>
                            <p className="text-sm text-secondary-foreground">{ticket.adminReply}</p>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
