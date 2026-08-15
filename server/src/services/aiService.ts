import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export interface AIAnalysisResult {
  classification: string;
  tags: string[];
  summary: string;
  riskScore: number;
  securityAnalysis: string;
}

export class AIService {
  private static aiClient: GoogleGenerativeAI | null = null;

  private static getClient(): GoogleGenerativeAI | null {
    if (!this.aiClient && env.GEMINI_API_KEY) {
      try {
        this.aiClient = new GoogleGenerativeAI(env.GEMINI_API_KEY);
        logger.info('Initialized Google Gemini AI Service client.');
      } catch (err) {
        logger.warn('Failed to initialize Google Gemini client, using heuristic fallback:', err);
      }
    }
    return this.aiClient;
  }

  public static async analyzeDocument(
    fileName: string,
    mimeType: string,
    contentSnippet?: string,
    fileSizeBytes: number = 0
  ): Promise<AIAnalysisResult> {
    const client = this.getClient();

    if (client && contentSnippet) {
      try {
        const prompt = `You are a cybersecurity and document classification AI. Analyze the following document details and snippet:
File Name: ${fileName}
MIME Type: ${mimeType}
Size: ${fileSizeBytes} bytes
Snippet: ${contentSnippet.substring(0, 2000)}

Return ONLY valid JSON in the following exact format without markdown formatting:
{
  "classification": "Financial | Legal | Source Code | Executive Summary | Medical | Personal Data | General Document",
  "tags": ["tag1", "tag2", "tag3"],
  "summary": "Concise 2-3 sentence document summary",
  "riskScore": 75,
  "securityAnalysis": "Brief explanation of sensitivity, PII risk, or security notes"
}`;

        const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const response = await model.generateContent(prompt);
        const text = response.response.text();
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);

        return {
          classification: parsed.classification || 'General Document',
          tags: Array.isArray(parsed.tags) ? parsed.tags : ['Secure', 'Encrypted'],
          summary: parsed.summary || 'Encrypted document analyzed by Gemini AI.',
          riskScore: typeof parsed.riskScore === 'number' ? parsed.riskScore : 15,
          securityAnalysis: parsed.securityAnalysis || 'No critical PII or vulnerabilities detected.',
        };
      } catch (err) {
        logger.warn('Gemini API call failed or timed out, falling back to analytical heuristic engine:', err);
      }
    }

    // Heuristic Analytical Engine Fallback (Zero-config)
    return this.heuristicAnalysis(fileName, mimeType, contentSnippet, fileSizeBytes);
  }

  private static heuristicAnalysis(
    fileName: string,
    mimeType: string,
    contentSnippet?: string,
    fileSizeBytes: number = 0
  ): AIAnalysisResult {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    const nameLower = fileName.toLowerCase();
    const text = (contentSnippet || '').toLowerCase();

    let classification = 'General Document';
    const tags: Set<string> = new Set(['AES-256-GCM', 'Protected']);
    let riskScore = 10;
    let summary = `Encrypted document (${(fileSizeBytes / 1024).toFixed(1)} KB) safely locked with AES-256 encryption.`;
    let securityAnalysis = 'Standard confidentiality policy applied. Data integrity validated with 16-byte authentication tag.';

    // Sensitivity & Credential checks
    const piiKeywords = [
      'api_key',
      'apikey',
      'secret',
      'secret_key',
      'password',
      'passcode',
      'ssn',
      'social security',
      'credit card',
      'private_key',
      'token',
      'bearer',
      'auth',
      'confidential',
      'financial',
      'tax',
      'salary',
      'contract',
      'invoice',
    ];

    const hasPii = piiKeywords.some((kw) => nameLower.includes(kw) || text.includes(kw));

    if (hasPii) {
      riskScore = 80;
      tags.add('Sensitive');
      tags.add('High Security');
      tags.add('Restricted');
      classification = 'Confidential / Sensitive Data';
      securityAnalysis = 'Contains private credentials, keys, or sensitive financial/PII keywords. Security alert recorded.';
      summary = `High-sensitivity document detected containing credentials or private keys. Stored with strict encryption policy.`;
    }

    // File type heuristics
    if (ext === 'pdf' || mimeType.includes('pdf')) {
      if (!hasPii) classification = 'PDF Document';
      tags.add('PDF');
    } else if (['zip', 'tar', 'gz', '7z', 'rar'].includes(ext)) {
      if (!hasPii) classification = 'Compressed Archive';
      tags.add('Archive');
      if (!hasPii) riskScore += 15;
    } else if (['js', 'ts', 'py', 'java', 'cpp', 'go', 'json', 'env'].includes(ext) || mimeType.includes('code') || mimeType.includes('json')) {
      if (!hasPii) classification = 'Source Code / Data';
      tags.add('Code');
      if (ext === 'env' || nameLower.includes('secret') || nameLower.includes('config')) {
        riskScore = Math.max(riskScore, 75);
        tags.add('Config');
      }
    } else if (['png', 'jpg', 'jpeg', 'svg', 'gif', 'webp'].includes(ext) || mimeType.startsWith('image/')) {
      classification = 'Image Asset';
      tags.add('Media');
    } else if (['docx', 'doc', 'txt', 'md'].includes(ext)) {
      if (!hasPii) classification = 'Text Document';
      tags.add('Document');
      if (contentSnippet && contentSnippet.length > 20 && !hasPii) {
        summary = `Document overview: "${contentSnippet.substring(0, 120).replace(/\n/g, ' ')}..."`;
      }
    }

    return {
      classification,
      tags: Array.from(tags),
      summary,
      riskScore: Math.min(riskScore, 95),
      securityAnalysis,
    };
  }
}
