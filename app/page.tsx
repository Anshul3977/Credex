'use client';

import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { TOOLS } from '@/data/pricing';
import { auditInputSchema, AuditInputFormValues } from '@/lib/schema';
import { Trash2, Plus, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';

export default function AuditFormPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isClient, setIsClient] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const form = useForm<AuditInputFormValues>({
    resolver: zodResolver(auditInputSchema),
    defaultValues: {
      teamSize: 1,
      primaryUseCase: '',
      tools: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: 'tools',
    control: form.control,
  });

  // Load from localStorage on mount
  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem('spendlens_form_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed) {
          form.reset(parsed);
        }
      } catch (e) {
        // ignore parse error
      }
    }
  }, [form]);

  // Save to localStorage on change
  useEffect(() => {
    const subscription = form.watch((value) => {
      localStorage.setItem('spendlens_form_state', JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const nextStep = async () => {
    let valid = false;
    if (step === 1) {
      valid = await form.trigger(['teamSize', 'primaryUseCase']);
    } else if (step === 2) {
      valid = await form.trigger(['tools']);
      if (valid && fields.length === 0) {
        form.setError('tools', { message: 'Please add at least one tool' });
        valid = false;
      }
    }
    if (valid) setStep((s) => s + 1);
  };

  const prevStep = () => setStep((s) => s - 1);

  const onSubmit = async (data: AuditInputFormValues) => {
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result = await res.json();
      
      if (res.ok && result.id) {
        localStorage.removeItem('spendlens_form_state');
        router.push(`/audit/${result.id}`);
      } else {
        setSubmitError('Something went wrong. Please try again.');
        setIsSubmitting(false);
      }
    } catch (e) {
      console.error(e);
      setSubmitError('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (!isClient) return null; // Prevent hydration mismatch

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            SpendLens
          </h1>
          <p className="mt-2 text-lg text-slate-600">
            Free AI tool spend audit for your team.
          </p>
        </div>

        <Card className="shadow-lg border-slate-200">
          <CardHeader className="bg-white border-b border-slate-100 pb-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-semibold">
                {step === 1 && 'Team Context'}
                {step === 2 && 'Tool Stack'}
                {step === 3 && 'Review & Submit'}
              </CardTitle>
              <div className="flex space-x-2">
                <Badge variant={step >= 1 ? 'default' : 'secondary'} className="w-8 h-8 rounded-full flex items-center justify-center p-0">1</Badge>
                <div className="w-4 h-[1px] bg-slate-300 mt-4"></div>
                <Badge variant={step >= 2 ? 'default' : 'secondary'} className="w-8 h-8 rounded-full flex items-center justify-center p-0">2</Badge>
                <div className="w-4 h-[1px] bg-slate-300 mt-4"></div>
                <Badge variant={step >= 3 ? 'default' : 'secondary'} className="w-8 h-8 rounded-full flex items-center justify-center p-0">3</Badge>
              </div>
            </div>
            <CardDescription className="text-slate-500 mt-2">
              {step === 1 && 'Tell us a bit about your team size and primary use case.'}
              {step === 2 && 'Add the AI tools your team currently pays for.'}
              {step === 3 && 'Review your details before running the audit engine.'}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6 pb-8 px-6 sm:px-10">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                {/* STEP 1 */}
                <div className={step === 1 ? 'block' : 'hidden'}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="teamSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Team Size</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="primaryUseCase"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Use Case</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a use case" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Coding">Software Engineering / Coding</SelectItem>
                              <SelectItem value="Writing">Content / Copywriting</SelectItem>
                              <SelectItem value="Research">Research / Analysis</SelectItem>
                              <SelectItem value="Design">Design / Creative</SelectItem>
                              <SelectItem value="Operations">Operations / Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* STEP 2 */}
                <div className={step === 2 ? 'block' : 'hidden'}>
                  {fields.map((field, index) => {
                    const currentToolId = form.watch(`tools.${index}.toolId`);
                    const selectedTool = TOOLS.find(t => t.id === currentToolId);

                    return (
                      <div key={field.id} className="relative bg-slate-50 border border-slate-200 rounded-lg p-5 mb-4">
                        <div className="absolute top-4 right-4">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-red-500"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                          {/* Tool Name Dropdown */}
                          <FormField
                            control={form.control}
                            name={`tools.${index}.toolId`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tool</FormLabel>
                                <Select 
                                  onValueChange={(val) => {
                                    field.onChange(val);
                                    form.setValue(`tools.${index}.planId`, ''); // reset plan
                                  }} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select tool" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {TOOLS.map((t) => (
                                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Plan Dropdown */}
                          <FormField
                            control={form.control}
                            name={`tools.${index}.planId`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Plan</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  value={field.value}
                                  disabled={!selectedTool}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select plan" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {selectedTool?.plans.map((p) => (
                                      <SelectItem key={p.id} value={p.id}>
                                        {p.name} (${p.pricePerSeat}/seat)
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Seats */}
                          <FormField
                            control={form.control}
                            name={`tools.${index}.seats`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Seats / Users</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min={1}
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Monthly Spend */}
                          <FormField
                            control={form.control}
                            name={`tools.${index}.monthlySpend`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Monthly Spend ($)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    );
                  })}

                  {fields.length < 10 && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-dashed border-2 text-slate-600 hover:text-slate-900 mt-2"
                      onClick={() => append({ toolId: '', planId: '', seats: 1, monthlySpend: 0 })}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Tool
                    </Button>
                  )}
                  {form.formState.errors.tools?.root && (
                    <p className="text-sm font-medium text-destructive mt-2">{form.formState.errors.tools.root.message}</p>
                  )}
                </div>

                {/* STEP 3 */}
                <div className={step === 3 ? 'block' : 'hidden'}>
                  <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                    <h3 className="text-lg font-medium text-slate-900 mb-4">Summary</h3>
                    <div className="flex justify-between py-2 border-b border-slate-200">
                      <span className="text-slate-600">Team Size</span>
                      <span className="font-semibold">{form.getValues().teamSize}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-200">
                      <span className="text-slate-600">Primary Use Case</span>
                      <span className="font-semibold">{form.getValues().primaryUseCase}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-200">
                      <span className="text-slate-600">Tools Tracked</span>
                      <span className="font-semibold">{form.getValues().tools.length}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-slate-600">Total Monthly Spend</span>
                      <span className="font-semibold text-red-600">
                        ${form.getValues().tools.reduce((sum, t) => sum + (t.monthlySpend || 0), 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="flex justify-between items-center">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={prevStep}
                    disabled={step === 1 || isSubmitting}
                    className="text-slate-600"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  
                  {step < 3 ? (
                    <Button type="button" onClick={nextStep} className="bg-slate-900 hover:bg-slate-800">
                      Continue <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-white">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Running audit...
                        </>
                      ) : (
                        'Run Audit'
                      )}
                    </Button>
                  )}
                </div>

                {submitError && (
                  <p className="text-sm font-medium text-red-600 text-center mt-4">
                    {submitError}
                  </p>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
