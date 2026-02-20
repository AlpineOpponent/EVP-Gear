import { z } from 'zod';

export const TagPathSchema = z.object({
  tt: z.string().min(1, 'Top-Tag is required'),
  mt: z.string().optional(),
  bt: z.string().optional(),
});

export type TagPath = z.infer<typeof TagPathSchema>;

export const WeightTypeSchema = z.enum(['standard', 'worn', 'consumable']);
export type WeightType = z.infer<typeof WeightTypeSchema>;

export const GearItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  brand: z.string().optional(),
  weight: z.number().int().nonnegative(),
  weightType: WeightTypeSchema.default('standard'),
  notes: z.string().optional(),
  tagPath: TagPathSchema,
});

export type GearItem = z.infer<typeof GearItemSchema>;

export const PackItemSchema = z.object({
  gearId: z.string().uuid(),
  qty: z.number().int().positive().default(1),
  overrideWeight: z.number().int().nonnegative().optional(), // In grams, for consumables
});

export type PackItem = z.infer<typeof PackItemSchema>;


export const PackSchema = z.object({
  id: z.string().uuid(),
  packName: z.string().min(1, 'Pack name is required'),
  items: z.array(PackItemSchema),
});

export type Pack = z.infer<typeof PackSchema>;

export interface ExportData {
  packName: string;
  date: string;
  items: (GearItem & { qty: number })[];
  stats: {
    total: number;
    base: number;
    worn: number;
    consumable: number;
  };
}
