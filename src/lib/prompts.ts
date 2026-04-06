import { TaskType, DistributionType, Feature } from '../store/datasmith';

export const PROMPTS = {
  SUGGEST_SCHEMA: (taskDescription: string, taskType: TaskType) => `
You are a machine learning data engineer. A user wants to generate a synthetic dataset for the following ML task:

Task: "${taskDescription}"
Task Type: "${taskType}"

Return a JSON object with exactly this structure:
{
  "features": [
    {
      "name": "feature_name",
      "type": "string | integer | float | boolean | category",
      "hint": "brief description of what realistic values look like"
    }
  ],
  "labels": ["label1", "label2"],
  "suggested_distribution": "balanced | imbalanced",
  "notes": "one sentence of advice for this dataset type"
}

Rules:
- Suggest 5 to 8 features that are realistic and relevant to the task
- Feature names must be lowercase with underscores (snake_case)
- Suggest 2 to 5 class labels appropriate for the task type
- Return only valid JSON. No explanation, no markdown fences.
`,

  SUGGEST_SCHEMA_GROUNDED: (taskDescription: string, taskType: string, locationContext: string) => `
You are a machine learning data engineer with expertise in global regulations,
local laws, and regional economic conditions across all countries and jurisdictions.

A user wants to generate a synthetic dataset for the following ML task:

Task: "${taskDescription}"
Task Type: "${taskType}"
Location: "${locationContext}"
Regional constraints: ENABLED

Your job is to suggest a realistic feature schema grounded in actual laws,
policies, thresholds, and demographic distributions for ${locationContext}.

Important:
- Use the local currency for all monetary values (e.g. Naira ₦ for Nigeria,
  Shilling KSh for Kenya, Pound £ for UK, Dollar $ for USA)
- Use locally realistic value ranges — Nigerian income distributions differ
  vastly from US income distributions. Do not apply American defaults globally.
- Reference actual local institutions and regulations where relevant
  (e.g. CBN, FIRS, NAFDAC for Nigeria; FCA for UK; RBI for India)
- If this is a well-known jurisdiction (Nigeria, USA, UK, Kenya, South Africa,
  India, etc.) use specific real thresholds with high confidence
- If the jurisdiction is less documented, use your best estimate and flag
  everything in the assumptions array with low confidence

Return a JSON object with exactly this structure:
{
  "features": [
    {
      "name": "feature_name_in_snake_case",
      "type": "string | integer | float | boolean | category",
      "hint": "brief description of what realistic local values look like",
      "constraint": "specific real-world constraint for ${locationContext}",
      "value_range": "realistic min–max or category list for this jurisdiction",
      "confidence": "high | medium | low"
    }
  ],
  "labels": ["label1", "label2"],
  "label_boundary": "plain English description of the exact decision rule separating labels, grounded in ${locationContext} law or policy",
  "suggested_distribution": "balanced | imbalanced",
  "jurisdiction_confidence": "high | medium | low",
  "currency_symbol": "local currency symbol e.g. ₦ or $ or £ or KSh",
  "currency_code": "ISO 4217 code e.g. NGN or USD or GBP or KES",
  "assumptions": [
    "any threshold or rule you are not 100% certain about — be explicit and specific"
  ],
  "notes": "one sentence summary of the key local rule or policy driving this task's label boundary"
}

Rules:
- Feature names must be snake_case
- Use REAL local thresholds — do not convert to USD or use American defaults
- If you are unsure about a specific threshold, include it in assumptions
  and set confidence to low for that feature
- Return only valid JSON and in simple,structures and understandable format. No explanation, no markdown fences.
-Do not hallucinate under any and every circumstances
`,

  VALIDATE_LOCATION: (input: string) => `
    A user entered this location for a data generation task: "${input}"
    
    Return a JSON object:
    {
      "is_ambiguous": true | false,
      "interpretations": ["possible place 1", "possible place 2"],
      "suggested_clarification": "Did you mean Lagos, Nigeria or Lagos, Portugal?",
      "recommended_input": "Lagos, Nigeria",
      "confidence": "high | medium | low"
    }
    
    If the location is clear and unambiguous, set is_ambiguous to false 
    and leave interpretations empty.
    Return only valid JSON.
  `,

  GENERATE_BATCH: (
    batchSize: number, 
    taskDescription: string, 
    taskType: TaskType, 
    features: Feature[], 
    labels: string[], 
    distribution: DistributionType, 
    edgeCaseBoost: boolean
  ) => `
You are a synthetic data generator. Generate exactly ${batchSize} rows of realistic synthetic data for this ML task.

Task: "${taskDescription}"
Task Type: "${taskType}"

Schema:
${JSON.stringify(features)}

Labels: ${labels.join(", ")}
Distribution: ${distribution}
Edge Cases: ${edgeCaseBoost ? "Include 15% ambiguous boundary examples" : "Standard examples only"}

Return a JSON array of ${batchSize} objects. Each object must have exactly these keys: ${features.map(f => f.name).join(", ")}, "label".

Rules:
- Values must be realistic and varied — not repetitive
- Respect the data types strictly (integers must be integers, etc.)
- For category types, use realistic string values
- Follow the distribution: ${distribution}
- Return only a valid JSON array. No explanation, no markdown fences.
`,

  GENERATE_BATCH_GROUNDED: (
    batchSize: number, 
    taskDescription: string, 
    taskType: TaskType, 
    locationContext: string,
    currencySymbol: string,
    currencyCode: string,
    features: Feature[], 
    labels: string[], 
    labelBoundary: string,
    distributionConfig: DistributionType, 
    edgeCaseBoost: boolean,
    detectedConstraints: any[]
  ) => `
You are a synthetic data generator with deep knowledge of global regulations
and local economic conditions.

Generate exactly ${batchSize} rows of realistic synthetic data for this ML task.

Task: "${taskDescription}"
Task Type: "${taskType}"
Location: "${locationContext}"
Currency: ${currencySymbol} (${currencyCode})

Schema:
${JSON.stringify(features)}

Labels: ${labels.join(", ")}
Label boundary: ${labelBoundary || "Not specified"}
Distribution: ${distributionConfig}
Edge cases: ${edgeCaseBoost ? "Include 15% boundary cases near the decision threshold" : "Standard distribution"}

Regional constraints to enforce strictly on every row:
${detectedConstraints.map(c => `- ${c.featureName}: ${c.description} | Range: ${c.valueRange}`).join('\n')}

Return a JSON array of exactly ${batchSize} objects.
Each object must have these keys: ${features.map(f => f.name).join(", ")}, "label".

Rules:
- All monetary values MUST be output as formatted strings that include the correct currency symbol (e.g. "${currencySymbol}50,000" or "${currencySymbol}1.5M") instead of raw numbers.
- All monetary values must use ${currencyCode} — not USD.
- Every row must be internally consistent with ${locationContext} rules
- The label for each row must correctly follow the label boundary above
- Never generate a row where feature values contradict the assigned label
- Values must be varied and realistic for ${locationContext} —
  not copied from American or European datasets
- Return only a valid JSON array. No explanation, no markdown fences.
`,

  GENERATE_CARD: (
    taskDescription: string,
    taskType: TaskType,
    features: Feature[],
    labels: string[],
    totalRows: number,
    labelNoise: number,
    missingValues: number,
    date: string
  ) => `
Generate a professional HuggingFace-style dataset card in markdown format for this synthetic dataset.

Dataset name: datasmith-dataset
Task: "${taskDescription}"
Task Type: "${taskType}"
Features: ${JSON.stringify(features)}
Labels: ${labels.join(", ")}
Rows: ${totalRows}
Noise level: ${labelNoise}%
Missing values: ${missingValues}%
Generated: ${date}

Include these sections: Dataset Summary, Task Description, Features, Label Distribution, Known Limitations, Intended Use, Citation.
Keep it professional and concise. Return only the markdown.
`,

  GENERATE_CARD_GROUNDED: (
    taskSlug: string,
    taskDescription: string,
    taskType: TaskType,
    locationContext: string,
    currencySymbol: string,
    currencyCode: string,
    features: Feature[],
    labels: string[],
    labelBoundary: string,
    totalRows: number,
    labelNoise: number,
    missingValues: number,
    jurisdictionConfidence: string,
    detectedConstraints: any[],
    constraintAssumptions: string[],
    date: string
  ) => `
Generate a professional HuggingFace-style dataset card in markdown for this dataset.

Dataset name: datasmith-${taskSlug}
Task: "${taskDescription}"
Task Type: "${taskType}"
Location: "${locationContext}"
Currency: ${currencySymbol} (${currencyCode})
Features: ${JSON.stringify(features)}
Labels: ${labels.join(", ")}
Label boundary: ${labelBoundary}
Rows: ${totalRows}
Noise level: ${labelNoise}%
Missing values: ${missingValues}%
Regional grounding: ENABLED
Jurisdiction confidence: ${jurisdictionConfidence}
Constraints applied: ${detectedConstraints.map(c => c.description).join("; ")}
Assumptions flagged: ${constraintAssumptions.join("; ")}
Generated: ${date}

Include these sections in order:
1. Dataset Summary
2. Task Description
3. Regional Grounding (REQUIRED)
   - Jurisdiction: ${locationContext}
   - List every constraint applied with its source institution
   - State the confidence level and what it means for data quality
   - If confidence is medium or low, explicitly warn user to verify thresholds
4. Features (markdown table: name | type | description | regional constraint | confidence)
5. Label Definition (exact decision boundary used)
6. Known Limitations
   - List all flagged assumptions by name
   - Note that regulations change — thresholds should be re-verified annually
   - Note this dataset should not be applied to other jurisdictions without re-grounding
7. Intended Use
8. Out-of-Scope Use
9. Citation

    return only the markdown. No preamble.
`,

  DESCRIPTION_PROMPT: (
    taskDescription: string,
    locationContext: string,
    totalRows: number,
    labels: string,
    labelBoundary: string,
    featureNames: string
  ) => `
In 3-4 plain English sentences, explain what this dataset contains and what it is good for. Write it for someone who is not a data scientist. Avoid technical jargon. Mention the location, the task, the label meaning, and one practical use case.

Dataset details:
- Task: ${taskDescription}
- Location: ${locationContext || "Not specified"}
- Rows: ${totalRows}
- Labels: ${labels} based on: ${labelBoundary || "Not specified"}
- Features: ${featureNames}
`

};
