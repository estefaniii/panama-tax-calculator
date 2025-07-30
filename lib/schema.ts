// lib/schema.ts
import { pgTable, serial, numeric, timestamp } from 'drizzle-orm/pg-core';

export const taxCalculations = pgTable('tax_calculations', {
	id: serial('id').primaryKey(),
	income: numeric('income', { precision: 12, scale: 2 }).notNull(),
	tax: numeric('tax', { precision: 12, scale: 2 }).notNull(),
	calculation_date: timestamp('calculation_date').defaultNow().notNull(),
});

export type TaxCalculation = typeof taxCalculations.$inferSelect;
export type NewTaxCalculation = typeof taxCalculations.$inferInsert;

export const schema = {
	taxCalculations,
};
