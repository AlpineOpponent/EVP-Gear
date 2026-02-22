import React, { useEffect, useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { GearItemSchema, type GearItem, type WeightType } from '../types/gear';
import { db } from '../db/db';
import { useTagSuggestions, findTagParents, isNewTopTag, useBrandSuggestions } from '../hooks/useTagSuggestions';
import { InputGroup } from '../components/shared/InputGroup';
import { Button } from '../components/shared/Button';
import { TagSelect } from '../components/shared/TagSelect';
import { AlertCircle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '../store/useSettingsStore';
import { inputToGrams, gramsToInput } from '../lib/gearUtils';
import { toast } from 'sonner';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

export const EditPage = ({ initialData, onComplete }: { initialData?: GearItem; onComplete?: () => void }) => {
  const { units } = useSettingsStore();
  const previousUnits = useRef(units);
  const [isNewTT, setIsNewTT] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  useKeyboardShortcuts({
    'ctrl+s': () => submitButtonRef.current?.click(),
    'meta+s': () => submitButtonRef.current?.click(),
    'escape': () => reset()
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm<GearItem>({
    resolver: zodResolver(GearItemSchema) as any,
    defaultValues: initialData ? {
      ...initialData,
      weight: gramsToInput(initialData.weight, units)
    } : {
      id: crypto.randomUUID(),
      weight: 0,
      weightType: 'standard',
      tagPath: { tt: '', mt: '', bt: '' },
    },
  });

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        weight: gramsToInput(initialData.weight, units)
      });
    }
  }, [initialData, reset]); // Removed units to avoid overriding unsaved edits when unit changes

  // Handle unit conversion for in-progress edits
  useEffect(() => {
    if (previousUnits.current !== units) {
      const currentWeight = watch('weight') || 0;
      const asGrams = inputToGrams(currentWeight, previousUnits.current);
      const newWeight = gramsToInput(asGrams, units);
      setValue('weight', newWeight);
      previousUnits.current = units;
    }
  }, [units, watch, setValue]);

  const watchTt = watch('tagPath.tt');
  const watchMt = watch('tagPath.mt');
  const watchBt = watch('tagPath.bt');
  const watchWeightType = watch('weightType');

  const suggestions = useTagSuggestions(watchTt, watchMt);
  const brandSuggestions = useBrandSuggestions() || [];

  // Handle BT auto-fill logic
  useEffect(() => {
    const checkParents = async () => {
      if (watchBt && !watchTt && !watchMt) {
        const parents = await findTagParents(watchBt);
        if (parents) {
          setValue('tagPath.tt', parents.tt);
          if (parents.mt) setValue('tagPath.mt', parents.mt);
        }
      }
    };
    checkParents();
  }, [watchBt, watchTt, watchMt, setValue]);

  // Handle New Tag Warning
  useEffect(() => {
    const checkNew = async () => {
      if (watchTt) {
        const isNew = await isNewTopTag(watchTt);
        setIsNewTT(isNew);
      } else {
        setIsNewTT(false);
      }
    };
    checkNew();
  }, [watchTt]);

  const onSubmit = async (data: GearItem) => {
    try {
      // Convert weight back to grams for database storage
      const finalData = {
        ...data,
        weight: inputToGrams(data.weight, units)
      };

      await db.gearItems.put(finalData);
      setSuccessMsg('Gear saved successfully!');
      setTimeout(() => {
        setSuccessMsg('');
        if (!initialData) {
          reset({
            id: crypto.randomUUID(),
            name: '',
            brand: '',
            weight: 0,
            weightType: 'standard',
            notes: '',
            tagPath: { tt: '', mt: '', bt: '' },
          });
        } else {
            onComplete?.();
        }
      }, 2000);
    } catch (err) {
      console.error('Failed to save gear:', err);
    }
  };

  const handleDelete = async () => {
    if (!initialData) return;

    try {
      const itemToDelete = { ...initialData };
      await db.gearItems.delete(initialData.id);
      onComplete?.();

      toast(`Deleted "${itemToDelete.name}"`, {
        action: {
          label: 'Undo',
          onClick: async () => {
            await db.gearItems.add(itemToDelete);
            toast.success(`Restored "${itemToDelete.name}"`);
          }
        }
      });
    } catch (err) {
      console.error('Failed to delete gear:', err);
      toast.error('Failed to delete gear');
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 md:gap-[32px] p-4 md:p-[48px] md:px-[40px] h-full overflow-auto bg-background">
      <div className="flex flex-col gap-2 w-full max-w-[1359px]">
        <h1 className="text-[38px] font-display font-normal tracking-[-1px] text-primary-foreground">
          {initialData ? 'Edit Gear' : 'Add Gear'}
        </h1>
      </div>

      <div id="tour-edit-form" className="bg-card rounded-[12px] p-4 md:p-8 flex flex-col gap-8 w-full max-w-[1359px] border border-border/50 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit as any)} className="flex flex-col gap-8">
          <div className="flex flex-col gap-8">
            <h2 className="text-[14px] font-semibold text-primary-foreground">Gear Attributes</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup
                label="Name"
                placeholder="e.g. Defence 4"
                {...register('name')}
                className={errors.name ? "border-destructive" : ""}
              />
              <Controller
                name="brand"
                control={control}
                render={({ field }) => (
                  <TagSelect
                    label="Brand"
                    placeholder="e.g. Carinthia"
                    value={field.value || ''}
                    onChange={field.onChange}
                    options={brandSuggestions}
                  />
                )}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[402px_231px_1fr] gap-6 items-start">
              <InputGroup
                label={`Weight (${units === 'metric' ? 'g' : 'oz'})`}
                type="number"
                step={units === 'metric' ? '1' : '0.01'}
                placeholder="0"
                {...register('weight', { valueAsNumber: true })}
                className={errors.weight ? "border-destructive" : ""}
              />

              <div className="flex flex-col gap-3">
                <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">
                  Weight Type
                </span>
                <div className="flex gap-[10px]">
                  {(['standard', 'worn', 'consumable'] as WeightType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setValue('weightType', t)}
                      className={cn(
                        "px-[10px] py-[4px] rounded-full text-[11px] font-medium transition-colors capitalize border border-transparent",
                        watchWeightType === t
                          ? "bg-primary/10 text-primary border-primary/20"
                          : "bg-surface-elevated text-text-tertiary hover:text-primary-foreground"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <InputGroup
                label="Notes"
                placeholder="Add details..."
                {...register('notes')}
              />
            </div>
          </div>

          <div id="tour-tag-system" className="flex flex-col gap-8">
            <div className="flex items-center gap-4">
              <h2 className="text-[14px] font-semibold text-primary-foreground">Tag Selection</h2>
              {isNewTT && (
                <div className="flex items-center gap-1.5 text-orange-light animate-pulse bg-orange-light/5 px-2 py-0.5 rounded border border-orange-light/20">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-medium">Creating new category...</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Controller
                name="tagPath.tt"
                control={control}
                render={({ field }) => (
                  <TagSelect
                    label="Top (Required)"
                    placeholder="Select or type..."
                    value={field.value}
                    onChange={field.onChange}
                    options={suggestions?.tt || []}
                    className={errors.tagPath?.tt ? "border-destructive" : ""}
                  />
                )}
              />
              <Controller
                name="tagPath.mt"
                control={control}
                render={({ field }) => (
                  <TagSelect
                    label="Middle (Optional)"
                    placeholder="Select or type..."
                    value={field.value || ''}
                    onChange={field.onChange}
                    options={suggestions?.mt || []}
                  />
                )}
              />
              <Controller
                name="tagPath.bt"
                control={control}
                render={({ field }) => (
                  <TagSelect
                    label="Base (Optional)"
                    placeholder="Select or type..."
                    value={field.value || ''}
                    onChange={field.onChange}
                    options={suggestions?.bt || []}
                  />
                )}
              />
            </div>
          </div>

          <div className="flex justify-end items-center gap-3 pt-4 border-t border-border/50">
            {successMsg && (
              <div className="flex items-center gap-2 text-success mr-auto bg-success/5 px-3 py-1 rounded border border-success/20">
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">{successMsg}</span>
              </div>
            )}
            {initialData ? (
              <Button
                type="button"
                variant="secondary"
                onClick={handleDelete}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
              >
                Delete Entry
              </Button>
            ) : (
              <Button
                type="button"
                variant="secondary"
                onClick={() => reset()}
              >
                Clear Form
              </Button>
            )}
            <Button ref={submitButtonRef} type="submit">
              {initialData ? 'Update Entry' : 'Save Entry'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
