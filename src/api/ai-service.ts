// AI service for canvas editor

// Types for AI endpoints
export interface OutlineRequest {
  topic: string;
  criteria?: string;
}

export interface OutlineResponse {
  outline: OutlineItem[];
}

export interface OutlineItem {
  level: number;
  title: string;
  description?: string;
}

export interface AnalysisRequest {
  text: string;
  analysisType: AnalysisType;
}

export enum AnalysisType {
  SUMMARY = 'summary',
  FEEDBACK = 'feedback',
  GRAMMAR = 'grammar',
  STYLE = 'style'
}

export interface AnalysisResponse {
  analysis: string;
  suggestions?: string[];
}

// API client functions
const API_BASE_URL = '/api/ai';

/**
 * Generate an outline based on a topic and optional criteria
 */
export async function generateOutline(topic: string, criteria?: string): Promise<OutlineResponse> {
  const response = await fetch(`${API_BASE_URL}/outline`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, criteria })
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to generate outline');
  }
  
  return await response.json();
}

/**
 * Analyze text using AI
 */
export async function analyzeText(text: string, analysisType: AnalysisType): Promise<AnalysisResponse> {
  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, analysisType })
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to analyze text');
  }
  
  return await response.json();
}
