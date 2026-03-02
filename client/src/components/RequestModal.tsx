import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertRequestSchema, type InsertRequest } from "@shared/schema";
import { useCreateRequest } from "@/hooks/use-requests";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Send } from "lucide-react";

interface RequestModalProps {
  productId?: number;
  productName?: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function RequestModal({ productId, productName, trigger, open, onOpenChange }: RequestModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const handleOpenChange = isControlled ? onOpenChange : setInternalOpen;

  const { toast } = useToast();
  const createRequest = useCreateRequest();

  const form = useForm<InsertRequest>({
    resolver: zodResolver(insertRequestSchema),
    defaultValues: {
      productId: productId || null,
      name: "",
      phone: "",
      company: "",
      comment: productName ? `Interested in: ${productName}` : "",
      status: "new",
    },
  });

  const onSubmit = (data: InsertRequest) => {
    createRequest.mutate(data, {
      onSuccess: () => {
        toast({
          title: "Request Sent Successfully",
          description: "Our manager will contact you shortly to discuss wholesale terms.",
        });
        form.reset();
        handleOpenChange?.(false);
      },
      onError: () => {
        toast({
          title: "Error submitting request",
          description: "Please try again later or contact us via Telegram.",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {!isControlled && trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">Wholesale Request</DialogTitle>
          <DialogDescription>
            Leave your contact details to get our complete price list and partnership terms.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex flex-col items-center text-center gap-3">
            <p className="text-sm text-blue-800">Need an immediate answer?</p>
            <a 
              href="https://t.me/example_vladopt" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#0088cc] hover:bg-[#0077b5] text-white px-6 py-2.5 rounded-lg font-medium transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              <MessageCircle className="w-5 h-5" />
              Write to us on Telegram
            </a>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or fill the form</span>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 000-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Company Name LLC" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comment / Required Volume</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="I'm looking for..." 
                        className="resize-none" 
                        {...field} 
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-6 rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:-translate-y-0.5"
                disabled={createRequest.isPending}
              >
                {createRequest.isPending ? "Sending..." : "Submit Request"}
                <Send className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
