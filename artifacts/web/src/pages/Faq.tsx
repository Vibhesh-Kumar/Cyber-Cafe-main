import { useListFaqs } from "@workspace/api-client-react";
import { PageHeader } from "@/components/PageHeader";
import { LoadingPage } from "@/components/LoadingState";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function Faq() {
  const { data: faqs, isLoading } = useListFaqs();
  const [search, setSearch] = useState("");

  const filteredFaqs = useMemo(() => {
    if (!faqs) return [];
    return faqs.filter(faq => 
      faq.question.toLowerCase().includes(search.toLowerCase()) || 
      faq.answer.toLowerCase().includes(search.toLowerCase())
    );
  }, [faqs, search]);

  // Group by category
  const groupedFaqs = useMemo(() => {
    const groups: Record<string, typeof filteredFaqs> = {};
    filteredFaqs.forEach(faq => {
      const cat = faq.category || "General";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(faq);
    });
    return groups;
  }, [filteredFaqs]);

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader 
        title="Frequently Asked Questions" 
        description="Find quick answers to common questions about our services and processes."
      >
        <div className="relative mt-6 max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
          <Input 
            placeholder="Search for answers..." 
            className="pl-12 h-14 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-white rounded-full text-base"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </PageHeader>

      <div className="container mx-auto px-4 py-16 max-w-4xl flex-1">
        {isLoading ? (
          <LoadingPage />
        ) : filteredFaqs.length === 0 ? (
          <div className="text-center py-20 border rounded-2xl bg-muted/30">
            <Search className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-secondary mb-2">No answers found</h3>
            <p className="text-muted-foreground">Try adjusting your search terms.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(groupedFaqs).map(([category, items]) => (
              <div key={category}>
                <h2 className="text-2xl font-bold font-serif text-secondary mb-6 pb-2 border-b">{category}</h2>
                <Accordion type="multiple" className="space-y-4">
                  {items.map(faq => (
                    <AccordionItem key={faq.id} value={`item-${faq.id}`} className="border bg-card rounded-xl px-6 data-[state=open]:shadow-md transition-all">
                      <AccordionTrigger className="text-left text-base hover:no-underline hover:text-primary py-5">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
