import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useGetService, useCreateApplication, useAddApplicationDocument, usePayApplication, useRequestUploadUrl } from "@workspace/api-client-react";
import { PageHeader } from "@/components/PageHeader";
import { LoadingPage } from "@/components/LoadingState";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronLeft, CreditCard, FileUp, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export default function Apply() {
  const [, params] = useRoute("/apply/:id");
  const serviceId = params?.id ? parseInt(params.id) : 0;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { data: service, isLoading: serviceLoading } = useGetService(serviceId);
  const createApplication = useCreateApplication();
  const addDocument = useAddApplicationDocument();
  const payApplication = usePayApplication();
  const { mutateAsync: requestUploadUrl } = useRequestUploadUrl();

  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Form, 2: Documents, 3: Payment
  const [applicationId, setApplicationId] = useState<number | null>(null);
  const [formDataState, setFormDataState] = useState<any>({});
  
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, { file: File, objectPath: string | null, status: 'pending'|'uploading'|'done' }>>({});

  // Dynamic form generation
  const buildSchema = () => {
    if (!service) return z.object({});
    const schemaObj: any = {};
    service.formSchema.forEach(field => {
      let fieldSchema: any = z.string();
      if (field.type === "number") fieldSchema = z.string().or(z.number());
      if (field.type === "checkbox") fieldSchema = z.boolean();
      
      if (field.required) {
        if (field.type === "checkbox") {
          fieldSchema = fieldSchema.refine((val: boolean) => val === true, "This field is required");
        } else {
          fieldSchema = fieldSchema.min(1, "This field is required");
        }
      } else {
        fieldSchema = fieldSchema.optional();
      }
      schemaObj[field.name] = fieldSchema;
    });
    return z.object(schemaObj);
  };

  const form = useForm<Record<string, any>>({
    resolver: zodResolver(buildSchema()),
    defaultValues: {}
  });

  if (serviceLoading) return <LoadingPage />;
  if (!service) return <div>Service not found</div>;

  const handleFormSubmit = (data: any) => {
    setFormDataState(data);
    
    // Initialize document state
    const initialDocs: any = {};
    service.requiredDocuments.forEach(doc => {
      initialDocs[doc] = { file: null, objectPath: null, status: 'pending' };
    });
    setUploadedDocs(initialDocs);
    
    setStep(2);
  };

  const handleFileChange = (docName: string, file: File | null) => {
    if (file) {
      setUploadedDocs(prev => ({
        ...prev,
        [docName]: { file, objectPath: null, status: 'pending' }
      }));
    }
  };

  const submitDocuments = async () => {
    const missingDocs = service.requiredDocuments.filter(doc => !uploadedDocs[doc]?.file);
    if (missingDocs.length > 0) {
      toast({
        title: "Missing Documents",
        description: `Please upload: ${missingDocs.join(", ")}`,
        variant: "destructive"
      });
      return;
    }

    try {
      // 1. Create Application
      const app = await createApplication.mutateAsync({
        data: {
          serviceId: service.id,
          formData: formDataState
        }
      });
      setApplicationId(app.id);

      // 2. Upload all documents
      for (const docName of service.requiredDocuments) {
        const docState = uploadedDocs[docName];
        if (!docState.file) continue;

        setUploadedDocs(prev => ({ ...prev, [docName]: { ...prev[docName], status: 'uploading' } }));
        
        // Get upload URL
        const uploadRes = await requestUploadUrl({
          data: {
            name: docState.file.name,
            size: docState.file.size,
            contentType: docState.file.type
          }
        });

        // Upload to GCS
        await fetch(uploadRes.uploadURL, {
          method: "PUT",
          body: docState.file,
          headers: { "Content-Type": docState.file.type }
        });

        // Register document to application
        await addDocument.mutateAsync({
          id: app.id,
          data: {
            fileName: docName, // use requirement name as filename identifier, or file.name
            objectPath: uploadRes.objectPath
          }
        });

        setUploadedDocs(prev => ({ ...prev, [docName]: { ...prev[docName], objectPath: uploadRes.objectPath, status: 'done' } }));
      }

      setStep(3);
    } catch (error: any) {
      toast({
        title: "Error submitting application",
        description: error.message || "Failed to process your request",
        variant: "destructive"
      });
    }
  };

  const handlePayment = async () => {
    if (!applicationId) return;
    try {
      await payApplication.mutateAsync({ id: applicationId });
      toast({
        title: "Payment Successful",
        description: "Your application has been submitted and is under review.",
      });
      setLocation(`/portal/applications/${applicationId}`);
    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.message || "Could not process payment",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      <div className="bg-secondary text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" className="text-white hover:bg-white/10 px-2" onClick={() => step > 1 ? setStep(step - 1 as any) : setLocation(`/services/${service.id}`)}>
              <ChevronLeft className="h-5 w-5 mr-1" /> Back
            </Button>
            <h1 className="text-2xl font-bold font-serif">Apply for {service.name}</h1>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center max-w-2xl mt-8">
            <div className={`flex flex-col items-center flex-1 ${step >= 1 ? 'text-primary' : 'text-white/50'}`}>
              <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold mb-2 ${step >= 1 ? 'bg-primary text-white' : 'bg-white/20'}`}>1</div>
              <span className="text-sm font-medium hidden sm:block">Application Form</span>
            </div>
            <div className={`h-1 w-full flex-1 mx-2 rounded ${step >= 2 ? 'bg-primary' : 'bg-white/20'}`}></div>
            <div className={`flex flex-col items-center flex-1 ${step >= 2 ? 'text-primary' : 'text-white/50'}`}>
              <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold mb-2 ${step >= 2 ? 'bg-primary text-white' : 'bg-white/20'}`}>2</div>
              <span className="text-sm font-medium hidden sm:block">Upload Documents</span>
            </div>
            <div className={`h-1 w-full flex-1 mx-2 rounded ${step >= 3 ? 'bg-primary' : 'bg-white/20'}`}></div>
            <div className={`flex flex-col items-center flex-1 ${step >= 3 ? 'text-primary' : 'text-white/50'}`}>
              <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold mb-2 ${step >= 3 ? 'bg-primary text-white' : 'bg-white/20'}`}>3</div>
              <span className="text-sm font-medium hidden sm:block">Payment</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl flex-1">
        <Card className="shadow-lg border-0">
          <CardContent className="p-6 sm:p-10">
            {step === 1 && (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {service.formSchema.map((field) => (
                      <FormField
                        key={field.name}
                        control={form.control}
                        name={field.name}
                        render={({ field: formField }) => (
                          <FormItem className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                            <FormLabel>{field.label} {field.required && <span className="text-destructive">*</span>}</FormLabel>
                            <FormControl>
                              {field.type === 'textarea' ? (
                                <Textarea {...formField} />
                              ) : field.type === 'select' && field.options ? (
                                <Select onValueChange={formField.onChange} defaultValue={formField.value}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select an option" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {field.options.map((opt) => (
                                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : field.type === 'checkbox' ? (
                                <div className="flex items-center gap-2 pt-2">
                                  <Checkbox 
                                    checked={formField.value} 
                                    onCheckedChange={formField.onChange} 
                                  />
                                  <span className="text-sm text-muted-foreground">I agree</span>
                                </div>
                              ) : (
                                <Input type={field.type} {...formField} />
                              )}
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  
                  <div className="flex justify-end pt-6 border-t mt-8">
                    <Button type="submit" size="lg" className="px-8">
                      Next: Upload Documents <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </Form>
            )}

            {step === 2 && (
              <div className="space-y-8">
                <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 flex items-start gap-3">
                  <FileUp className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm text-secondary">
                    Please upload clear, legible copies of the following documents. Scanned PDFs or high-quality photos are accepted. Max size 5MB per file.
                  </p>
                </div>

                {service.requiredDocuments.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-secondary">No documents required</h3>
                    <p className="text-muted-foreground">You can proceed directly to the payment step.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {service.requiredDocuments.map(doc => (
                      <div key={doc} className="border rounded-xl p-4 sm:p-6 bg-card">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <h4 className="font-bold text-secondary flex items-center gap-2">
                              {doc} <span className="text-destructive">*</span>
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1">Upload PDF, JPG, or PNG</p>
                          </div>
                          
                          <div className="shrink-0">
                            {uploadedDocs[doc]?.status === 'uploading' ? (
                              <div className="flex items-center gap-2 text-primary font-medium">
                                <Loader2 className="h-4 w-4 animate-spin" /> Uploading...
                              </div>
                            ) : uploadedDocs[doc]?.status === 'done' ? (
                              <div className="flex items-center gap-2 text-green-600 font-medium">
                                <CheckCircle2 className="h-4 w-4" /> Uploaded
                              </div>
                            ) : (
                              <Input 
                                type="file" 
                                accept=".pdf,image/jpeg,image/png"
                                onChange={(e) => handleFileChange(doc, e.target.files?.[0] || null)}
                                className="w-full sm:w-auto"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between pt-6 border-t mt-8">
                  <Button variant="outline" onClick={() => setStep(1)}>Back to Form</Button>
                  <Button 
                    onClick={submitDocuments} 
                    size="lg"
                    disabled={createApplication.isPending || addDocument.isPending}
                  >
                    {createApplication.isPending ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                    ) : (
                      <>Next: Make Payment <ArrowRight className="ml-2 h-4 w-4" /></>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8 text-center py-8">
                <div className="mx-auto h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-6">
                  <CreditCard className="h-10 w-10 text-secondary" />
                </div>
                
                <h2 className="text-3xl font-bold font-serif text-secondary">Complete Payment</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Your application has been drafted. Please complete the payment of <strong className="text-secondary">₹{service.price}</strong> to submit it for review.
                </p>

                <div className="bg-muted/30 border rounded-2xl p-6 max-w-sm mx-auto my-8">
                  <div className="flex justify-between items-center mb-4 pb-4 border-b">
                    <span className="text-muted-foreground">Service</span>
                    <span className="font-bold text-secondary text-right">{service.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Processing Fee</span>
                    <span className="text-2xl font-bold text-primary">₹{service.price}</span>
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <Button 
                    size="lg" 
                    className="px-12 h-14 text-lg" 
                    onClick={handlePayment}
                    disabled={payApplication.isPending}
                  >
                    {payApplication.isPending ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                    ) : (
                      <>Pay ₹{service.price} Now</>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
