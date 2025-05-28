import { config } from 'dotenv';
config();

import '@/ai/flows/grammar-and-spelling-check.ts';
import '@/ai/flows/ai-suggestion-generation.ts';
import '@/ai/flows/vale-rule-integration.ts';