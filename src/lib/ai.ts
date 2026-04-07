import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { AIModel, TaskType, Feature, DistributionType } from "../store/datasmith";
import { PROMPTS } from "./prompts";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || "";

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;
const groq = GROQ_API_KEY ? new Groq({ apiKey: GROQ_API_KEY, dangerouslyAllowBrowser: true }) : null;


// Updated Groq model mapping matching the requirements
const MODEL_MAP: Record<string, string> = {
  llama: import.meta.env.VITE_MODEL_FAST || "llama-3.3-70b-versatile",
  deepseek: import.meta.env.VITE_MODEL_REASONING || "openai/gpt-oss-120b",
  instant: import.meta.env.VITE_MODEL_INSTANT || "llama-3.1-8b-instant",
};

function withTimeout<T>(promiseFn: () => Promise<T>, ms: number = 30000): Promise<T> {
  return new Promise((resolve, reject) => {
    const attemptCall = (retriesLeft: number) => {
      let timeoutId: any;
      const timeoutPromise = new Promise<T>((_, rej) => {
        timeoutId = setTimeout(() => rej(new Error(`Request timed out after ${ms}ms`)), ms);
      });
      Promise.race([promiseFn(), timeoutPromise])
        .then(res => { clearTimeout(timeoutId); resolve(res); })
        .catch(err => {
          clearTimeout(timeoutId);
          if (err?.message?.includes('timed out') && retriesLeft > 0) {
            console.warn(`[Datasmith] Request timed out, retrying...`);
            attemptCall(retriesLeft - 1);
          } else {
            reject(err);
          }
        });
    };
    attemptCall(1);
  });
}

// Fallback order: try the selected model, then try alternatives
const FALLBACK_ORDER: AIModel[] = ["llama", "gemini", "deepseek"];

async function callGemini(prompt: string, jsonMode: boolean = true, triggerFallbackEvent: boolean = false): Promise<string> {
  if (!genAI) throw new Error("Gemini API key not configured. Add VITE_GEMINI_API_KEY to your .env file.");
  
  const config: any = {};
  if (jsonMode) {
    config.responseMimeType = "application/json";
  }
  
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: config,
  });
  
  try {
    const result = await withTimeout(() => model.generateContent(prompt));
    return result.response.text();
  } catch (err: any) {
    const errorMsg = err?.message || String(err);
    if (err?.status === 429 || errorMsg.includes('429') || errorMsg.toLowerCase().includes('rate') || errorMsg.toLowerCase().includes('too many requests')) {
      if (triggerFallbackEvent && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('gemini-fallback'));
      }
      return callGroq(prompt, 'llama', jsonMode);
    }
    throw err;
  }
}

async function callGroq(prompt: string, modelKey: string, jsonMode: boolean = true): Promise<string> {
  if (!groq) throw new Error("Groq API key not configured. Add VITE_GROQ_API_KEY to your .env file.");
  
  const groqModel = MODEL_MAP[modelKey] || MODEL_MAP.llama;

  const config: any = {
    messages: [{ role: "user" as const, content: prompt }],
    model: groqModel,
  };
  
  if (jsonMode) {
    config.response_format = { type: "json_object" as const };
  }

  const completion = await withTimeout(() => groq!.chat.completions.create(config));
  return completion.choices[0].message.content || "";
}

function parseJSON(text: string): any {
  // Try direct parse first
  try {
    return JSON.parse(text);
  } catch {
    // Fallback: extract JSON from markdown fences or surrounding text
    const arrayMatch = text.match(/\[[\s\S]*\]/);
    if (arrayMatch) return JSON.parse(arrayMatch[0]);
    
    const objectMatch = text.match(/\{[\s\S]*\}/);
    if (objectMatch) return JSON.parse(objectMatch[0]);
    
    throw new Error("Could not parse AI response as JSON");
  }
}

async function callWithFallback(
  preferredModel: AIModel,
  prompt: string,
  jsonMode: boolean = true
): Promise<{ text: string; usedModel: AIModel }> {
  // Build try-order: preferred first, then fallbacks
  const tryOrder = [preferredModel, ...FALLBACK_ORDER.filter(m => m !== preferredModel)];
  
  const errors: string[] = [];
  
  for (const model of tryOrder) {
    try {
      let text: string;
      if (model === "gemini") {
        text = await callGemini(prompt, jsonMode, preferredModel === 'gemini');
      } else {
        text = await callGroq(prompt, model, jsonMode);
      }
      return { text, usedModel: model };
    } catch (err: any) {
      const msg = err?.message || String(err);
      console.warn(`[Datasmith] ${model} failed: ${msg}`);
      errors.push(`${model}: ${msg}`);
      // Continue to next model
    }
  }
  
  throw new Error(`All AI models failed.\n${errors.join("\n")}`);
}

// ─── Public API ─────────────────────────────────────────────

function selectModel(requiresGrounding: boolean): AIModel {
  if (requiresGrounding) {
    return 'deepseek';
  }
  return 'llama';
}

export interface LocationValidation {
  is_ambiguous: boolean;
  interpretations: string[];
  suggested_clarification: string;
  recommended_input: string;
  confidence: 'high' | 'medium' | 'low';
}

export async function validateLocation(input: string): Promise<LocationValidation> {
  // Just use Gemini or llama for fast validation
  const prompt = PROMPTS.VALIDATE_LOCATION(input);
  const { text } = await callWithFallback('gemini', prompt, true);
  return parseJSON(text);
}

export async function suggestSchema(
  model: AIModel, 
  taskDescription: string, 
  taskType: TaskType,
  locationContext?: string,
  applyRegionalConstraints?: boolean
) {
  const isGrounded = !!(locationContext?.trim() && applyRegionalConstraints);
  const selectedModel = model === 'gemini' ? 'gemini' : selectModel(isGrounded);
  
  const prompt = isGrounded 
    ? PROMPTS.SUGGEST_SCHEMA_GROUNDED(taskDescription, taskType, locationContext!)
    : PROMPTS.SUGGEST_SCHEMA(taskDescription, taskType);
    
  const { text } = await callWithFallback(selectedModel, prompt, true);
  return parseJSON(text);
}

export async function generateBatch(
  model: AIModel,
  batchSize: number,
  taskDescription: string,
  taskType: TaskType,
  features: Feature[],
  labels: string[],
  distribution: DistributionType,
  edgeCaseBoost: boolean,
  locationContext?: string,
  applyRegionalConstraints?: boolean,
  detectedConstraints?: any[],
  currencySymbol?: string,
  currencyCode?: string,
  labelBoundary?: string
) {
  const isGrounded = !!(locationContext?.trim() && applyRegionalConstraints);
  const selectedModel = model === 'gemini' ? 'gemini' : 'llama'; // All batch generation calls map to llama

  let totalRowsObtained: any[] = [];
  let rowsNeeded = batchSize;
  let attempt = 0;

  while (rowsNeeded > 0 && attempt < 3) {
    const prompt = isGrounded
      ? PROMPTS.GENERATE_BATCH_GROUNDED(
          rowsNeeded, taskDescription, taskType, locationContext!, currencySymbol || '$', currencyCode || 'USD',
          features, labels, labelBoundary || '', distribution, edgeCaseBoost, detectedConstraints || []
        )
      : PROMPTS.GENERATE_BATCH(
          rowsNeeded, taskDescription, taskType,
          features, labels, distribution, edgeCaseBoost
        );
    
    const { text } = await callWithFallback(selectedModel, prompt, true);
    const parsed = parseJSON(text);
    
    let newRows: any[] = [];
    if (Array.isArray(parsed)) newRows = parsed;
    else if (parsed.data && Array.isArray(parsed.data)) newRows = parsed.data;
    else if (parsed.rows && Array.isArray(parsed.rows)) newRows = parsed.rows;
    else {
      const firstArray = Object.values(parsed).find(v => Array.isArray(v));
      if (firstArray) newRows = firstArray as any[];
      else newRows = [parsed];
    }
    
    totalRowsObtained = totalRowsObtained.concat(newRows);
    if (totalRowsObtained.length >= batchSize) {
      return totalRowsObtained.slice(0, batchSize);
    }
    
    rowsNeeded = batchSize - totalRowsObtained.length;
    attempt++;
  }
  
  return totalRowsObtained;
}

export async function generateDatasetCard(
  model: AIModel,
  taskDescription: string,
  taskType: TaskType,
  features: Feature[],
  labels: string[],
  totalRows: number,
  labelNoise: number,
  missingValues: number,
  locationContext?: string,
  applyRegionalConstraints?: boolean,
  detectedConstraints?: any[],
  constraintAssumptions?: string[],
  jurisdictionConfidence?: string,
  currencySymbol?: string,
  currencyCode?: string,
  labelBoundary?: string
) {
  const isGrounded = !!(locationContext?.trim() && applyRegionalConstraints);
  const dateStr = new Date().toISOString().split("T")[0];

  const prompt = isGrounded
    ? PROMPTS.GENERATE_CARD_GROUNDED(
        "grounded", taskDescription, taskType, locationContext!, currencySymbol || '$', currencyCode || 'USD',
        features, labels, labelBoundary || '', totalRows, labelNoise, missingValues, 
        jurisdictionConfidence || 'low', detectedConstraints || [], constraintAssumptions || [], dateStr
      )
    : PROMPTS.GENERATE_CARD(
        taskDescription, taskType, features, labels,
        totalRows, labelNoise, missingValues, dateStr
      );

  const selectedModel = model === 'gemini' ? 'gemini' : 'llama'; // Dataset card goes to llama
  const { text } = await callWithFallback(selectedModel, prompt, false);
  return text;
}

export async function generateDatasetDescription(
  taskDescription: string,
  locationContext: string | undefined,
  totalRows: number,
  labels: string[],
  labelBoundary: string | undefined,
  features: Feature[]
) {
  const prompt = PROMPTS.DESCRIPTION_PROMPT(
    taskDescription,
    locationContext || "",
    totalRows,
    labels.join(", "),
    labelBoundary || "",
    features.map(f => f.name).join(", ")
  );

  // Plain English summary (Call 4) maps to llama-3.1-8b-instant
  const { text } = await callWithFallback("instant" as AIModel, prompt, false);
  return text;
}
