"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wand2 } from 'lucide-react';
import { suggestCategories } from '@/ai/flows/suggest-categories';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  accomplishmentDescription: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }).max(500, {
    message: "Description must not exceed 500 characters."
  }),
});

type FormData = z.infer<typeof formSchema>;

export function CategorySuggestionForm() {
  const [suggestedCategoriesList, setSuggestedCategoriesList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accomplishmentDescription: "",
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    setSuggestedCategoriesList([]);
    try {
      const result = await suggestCategories({ accomplishmentDescription: data.accomplishmentDescription });
      if (result.suggestedCategories && result.suggestedCategories.length > 0) {
        setSuggestedCategoriesList(result.suggestedCategories);
        toast({
          title: "Suggestions Ready!",
          description: "We've found some categories for your accomplishment.",
        });
      } else {
         setSuggestedCategoriesList(["No specific categories found, try rephrasing."]);
         toast({
          title: "No Suggestions Found",
          description: "Try describing your accomplishment differently.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching category suggestions:", error);
      toast({
        title: "Error",
        description: "Could not fetch category suggestions. Please try again.",
        variant: "destructive",
      });
       setSuggestedCategoriesList(["Error fetching suggestions."]);
    }
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Wand2 className="h-7 w-7 text-primary" />
          Suggest Categories
        </CardTitle>
        <CardDescription>
          Describe your accomplishment, and our AI will suggest relevant categories.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="accomplishmentDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="accomplishmentDescription" className="text-lg">Accomplishment Description</FormLabel>
                  <FormControl>
                    <Textarea
                      id="accomplishmentDescription"
                      placeholder="e.g., 'Won first place in the regional science fair with a project on renewable energy.'"
                      className="min-h-[120px] resize-none"
                      {...field}
                      aria-describedby="description-help"
                    />
                  </FormControl>
                   <p id="description-help" className="text-sm text-muted-foreground">
                    Provide a clear and concise description of what you achieved.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            {suggestedCategoriesList.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Suggested Categories:</h3>
                <div className="flex flex-wrap gap-2">
                  {suggestedCategoriesList.map((category, index) => (
                    <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              Get Suggestions
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
