const pool = require('../db');
const stringSimilarity = require('string-similarity');
const natural = require('natural');
const axios = require('axios');

class PlagiarismService {
  
  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.tfidf = new natural.TfIdf();
  }

  /* ==================== CODE NORMALIZATION ==================== */
  normalizeCode(code, language) {
    let normalized = code
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*/g, '')
      .replace(/#.*/g, '')
      .replace(/\s+/g, ' ')
      .replace(/['"]([^'"]*)['"]/g, 'STRING')
      .replace(/\b\d+\b/g, 'NUM')
      .trim();
    
    if (language === 'javascript' || language === 'java' || language === 'cpp' || language === 'c') {
      normalized = normalized.replace(/\{/g, ' { ').replace(/\}/g, ' } ');
    }
    
    return normalized;
  }

  /* ==================== ADVANCED NORMALIZATION ==================== */
  deepNormalizeCode(code, language) {
    let normalized = code
      .replace(/\/\*[\s\S]*?\*\//g, '') 
      .replace(/\/\/.*/g, '')
      .replace(/#.*/g, '');
    
    normalized = normalized.replace(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g, (match) => {
      const keywords = [
        'function', 'var', 'let', 'const', 'if', 'else', 'for', 'while', 
        'return', 'class', 'def', 'import', 'from', 'public', 'private',
        'int', 'float', 'double', 'void', 'string', 'bool', 'true', 'false'
      ];
      return keywords.includes(match.toLowerCase()) ? match : 'VAR';
    });
    
    normalized = normalized
      .replace(/['"]([^'"]*)['"]/g, 'STR')
      .replace(/\b\d+\.?\d*\b/g, 'NUM')
      .replace(/\s+/g, ' ')
      .trim();
    
    return normalized;
  }

  /* ==================== TOKENIZATION ==================== */
  tokenizeCode(code) {
    return code
      .split(/[\s\(\)\{\}\[\];,\.]+/)
      .filter(token => token.length > 2);
  }

  /* ==================== LEVENSHTEIN DISTANCE ==================== */
  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /* ==================== WINNOWING ALGORITHM ==================== */
  generateFingerprints(code, windowSize = 5, k = 3) {
    const tokens = this.tokenizeCode(code);
    const hashes = [];
    
    for (let i = 0; i <= tokens.length - k; i++) {
      const kgram = tokens.slice(i, i + k).join('');
      const hash = this.robustHash(kgram);
      hashes.push({ hash, position: i });
    }
    
    const fingerprints = [];
    for (let i = 0; i <= hashes.length - windowSize; i++) {
      const window = hashes.slice(i, i + windowSize);
      const minHash = window.reduce((min, curr) => 
        curr.hash < min.hash ? curr : min
      );
      
      if (fingerprints.length === 0 || 
          fingerprints[fingerprints.length - 1].position !== minHash.position) {
        fingerprints.push(minHash);
      }
    }
    
    return fingerprints;
  }

  robustHash(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash) + str.charCodeAt(i);
    }
    return Math.abs(hash);
  }

  /* ==================== MOSS-LIKE SIMILARITY ==================== */
  calculateMOSSSimilarity(code1, code2) {
    const fingerprints1 = this.generateFingerprints(code1);
    const fingerprints2 = this.generateFingerprints(code2);
    
    const hashes1 = new Set(fingerprints1.map(f => f.hash));
    const hashes2 = new Set(fingerprints2.map(f => f.hash));
    
    const intersection = new Set([...hashes1].filter(h => hashes2.has(h)));
    const union = new Set([...hashes1, ...hashes2]);
    
    return union.size > 0 ? (intersection.size / union.size) * 100 : 0;
  }

  /* ==================== SIMILARITY CALCULATION ==================== */
  async calculateSimilarity(code1, code2, lang1, lang2) {
    if (lang1 !== lang2) return 0;
    
    const norm1 = this.normalizeCode(code1, lang1);
    const norm2 = this.normalizeCode(code2, lang2);
    
    const deepNorm1 = this.deepNormalizeCode(code1, lang1);
    const deepNorm2 = this.deepNormalizeCode(code2, lang2);
    
    const stringSim = stringSimilarity.compareTwoStrings(norm1, norm2);
    const deepStringSim = stringSimilarity.compareTwoStrings(deepNorm1, deepNorm2);
    
    const tokens1 = new Set(this.tokenizeCode(norm1));
    const tokens2 = new Set(this.tokenizeCode(norm2));
    
    const intersection = new Set([...tokens1].filter(x => tokens2.has(x)));
    const union = new Set([...tokens1, ...tokens2]);
    const jaccardSim = union.size > 0 ? intersection.size / union.size : 0;
    
    const mossSim = this.calculateMOSSSimilarity(norm1, norm2) / 100;
    
    const maxLen = Math.max(deepNorm1.length, deepNorm2.length);
    const levDistance = this.levenshteinDistance(deepNorm1, deepNorm2);
    const levSim = maxLen > 0 ? 1 - (levDistance / maxLen) : 0;
    
    const ngramSim = this.calculateNGramSimilarity(norm1, norm2, 3);
    
    const finalScore = (
      stringSim * 0.20 +
      deepStringSim * 0.20 +
      jaccardSim * 0.20 +
      mossSim * 0.20 +
      levSim * 0.10 +
      ngramSim * 0.10
    ) * 100;
    
    return finalScore;
  }

  /* ==================== N-GRAM SIMILARITY ==================== */
  calculateNGramSimilarity(str1, str2, n = 3) {
    const getNGrams = (str, n) => {
      const ngrams = new Set();
      for (let i = 0; i <= str.length - n; i++) {
        ngrams.add(str.slice(i, i + n));
      }
      return ngrams;
    };
    
    const ngrams1 = getNGrams(str1, n);
    const ngrams2 = getNGrams(str2, n);
    
    const intersection = new Set([...ngrams1].filter(x => ngrams2.has(x)));
    const union = new Set([...ngrams1, ...ngrams2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  /* ==================== ENTROPY CALCULATION ==================== */
  calculateEntropy(code) {
    const tokens = this.tokenizeCode(code);
    const freq = {};
    
    tokens.forEach(token => {
      freq[token] = (freq[token] || 0) + 1;
    });
    
    let entropy = 0;
    const total = tokens.length;
    
    Object.values(freq).forEach(count => {
      const p = count / total;
      entropy -= p * Math.log2(p);
    });
    
    return entropy;
  }

  /* ==================== PERPLEXITY ANALYSIS ==================== */
  calculatePerplexity(code) {
    const tokens = this.tokenizeCode(code);
    if (tokens.length < 2) return 0;
    
    const bigramFreq = {};
    let totalBigrams = 0;
    
    for (let i = 0; i < tokens.length - 1; i++) {
      const bigram = `${tokens[i]}_${tokens[i + 1]}`;
      bigramFreq[bigram] = (bigramFreq[bigram] || 0) + 1;
      totalBigrams++;
    }
    
    let logProb = 0;
    Object.values(bigramFreq).forEach(count => {
      const prob = count / totalBigrams;
      logProb += Math.log(prob);
    });
    
    const perplexity = Math.exp(-logProb / totalBigrams);
    return perplexity;
  }

  /* ==================== BURSTINESS ANALYSIS ==================== */
  calculateBurstiness(code) {
    const lines = code.split('\n').filter(line => line.trim().length > 0);
    const lengths = lines.map(line => line.trim().length);
    
    if (lengths.length < 2) return 0;
    
    const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance = lengths.reduce((sum, len) => sum + Math.pow(len - mean, 2), 0) / lengths.length;
    const stdDev = Math.sqrt(variance);
    
    const burstiness = mean > 0 ? stdDev / mean : 0;
    
    return burstiness;
  }

  /* ==================== PATTERN-BASED AI DETECTION ==================== */
  detectAIPatterns(code, language) {
    const indicators = {
      score: 0,
      reasons: [],
      metrics: {}
    };
    
    const lines = code.split('\n');
    const normalized = this.normalizeCode(code, language);
    const tokens = this.tokenizeCode(normalized);
    
    // 1. ENTROPY
    const entropy = this.calculateEntropy(code);
    indicators.metrics.entropy = entropy.toFixed(2);
    
    if (entropy < 3.5) {
      indicators.score += 12;
      indicators.reasons.push(`Low entropy (${entropy.toFixed(2)})`);
    }
    
    // 2. PERPLEXITY
    const perplexity = this.calculatePerplexity(code);
    indicators.metrics.perplexity = perplexity.toFixed(2);
    
    if (perplexity < 5) {
      indicators.score += 15;
      indicators.reasons.push(`Low perplexity (${perplexity.toFixed(2)})`);
    }
    
    // 3. BURSTINESS
    const burstiness = this.calculateBurstiness(code);
    indicators.metrics.burstiness = burstiness.toFixed(2);
    
    if (burstiness < 0.3) {
      indicators.score += 13;
      indicators.reasons.push(`Low burstiness (${burstiness.toFixed(2)})`);
    }
    
    // 4. PERFECT FORMATTING
    const perfectIndentation = lines.every(line => {
      const spaces = line.match(/^\s*/)[0].length;
      return spaces % 2 === 0 || spaces % 4 === 0 || line.trim() === '';
    });
    
    if (perfectIndentation && lines.length > 10) {
      indicators.score += 10;
      indicators.reasons.push('Perfect indentation');
    }
    
    // 5. COMMENT DENSITY
    const commentLines = code.split('\n').filter(line => 
      line.trim().startsWith('//') || 
      line.trim().startsWith('#') ||
      line.includes('/*')
    ).length;
    
    const commentRatio = commentLines / lines.length;
    indicators.metrics.commentRatio = (commentRatio * 100).toFixed(1);
    
    if (commentRatio > 0.25) {
      indicators.score += 12;
      indicators.reasons.push(`High comment density (${(commentRatio * 100).toFixed(1)}%)`);
    }
    
    // 6. AI VARIABLES
    const aiVariablePatterns = [
      /result\d*/gi, /temp\d*/gi, /value\d*/gi, /data\d*/gi,
      /item\d*/gi, /element\d*/gi, /current[A-Z]\w*/g, /new[A-Z]\w*/g
    ];
    
    let aiVariableCount = 0;
    aiVariablePatterns.forEach(pattern => {
      const matches = code.match(pattern);
      if (matches) aiVariableCount += matches.length;
    });
    
    if (aiVariableCount > 5) {
      indicators.score += 11;
      indicators.reasons.push(`AI-typical variables (${aiVariableCount})`);
    }
    
    // 7. VOCABULARY RICHNESS
    const uniqueTokens = new Set(tokens);
    const vocabularyRichness = tokens.length > 0 ? uniqueTokens.size / tokens.length : 0;
    indicators.metrics.vocabularyRichness = (vocabularyRichness * 100).toFixed(1);
    
    if (vocabularyRichness > 0.65 && tokens.length > 30) {
      indicators.score += 10;
      indicators.reasons.push(`High vocabulary diversity (${(vocabularyRichness * 100).toFixed(1)}%)`);
    }
    
    // 8. LONG FUNCTION NAMES
    const longFunctionNames = code.match(/function\s+\w{15,}/g) || 
                               code.match(/def\s+\w{15,}/g) ||
                               code.match(/\w{15,}\s*\(/g);
    
    if (longFunctionNames && longFunctionNames.length > 2) {
      indicators.score += 9;
      indicators.reasons.push(`Overly descriptive names (${longFunctionNames.length})`);
    }
    
    // 9. LANGUAGE-SPECIFIC
    if (language === 'python') {
      const typeHintCount = (code.match(/:\s*\w+\s*=/g) || []).length +
                           (code.match(/->\s*\w+:/g) || []).length;
      if (typeHintCount > 3) {
        indicators.score += 8;
        indicators.reasons.push(`Consistent type hints (${typeHintCount})`);
      }
    }
    
    if (language === 'javascript') {
      const hasVar = code.includes('var ');
      const hasConst = code.includes('const ');
      const hasLet = code.includes('let ');
      
      if (!hasVar && (hasConst || hasLet)) {
        indicators.score += 7;
        indicators.reasons.push('Modern ES6+ syntax only');
      }
    }
    
    // 10. BOILERPLATE
    const boilerplatePatterns = [
      /This\s+(function|method|code)\s+/i,
      /The\s+following\s+/i,
      /Here'?s\s+(how|what|the)/i,
      /As\s+you\s+can\s+see/i,
      /Note\s+that/i,
      /It'?s\s+important\s+to/i
    ];
    
    let boilerplateCount = 0;
    boilerplatePatterns.forEach(pattern => {
      if (pattern.test(code)) boilerplateCount++;
    });
    
    if (boilerplateCount > 1) {
      indicators.score += 20;
      indicators.reasons.push(`AI-style explanatory text (${boilerplateCount})`);
    }
    
    indicators.score = Math.min(indicators.score, 100);
    
    return indicators;
  }

  /* ==================== CHATGPT AI DETECTION ==================== */
  async detectAIWithChatGPT(code, language) {
    if (!process.env.OPENAI_API_KEY) {
      console.log('⚠️  ChatGPT AI detection skipped: No API key');
      return null;
    }
    
    try {
      console.log('🤖 Running ChatGPT AI detection...');
      
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are an AI code detector. Analyze if the code was likely generated by AI (ChatGPT, Claude, Copilot, etc).

Consider these factors:
- Perfect formatting and consistent style
- Overly descriptive variable/function names
- Excessive comments explaining obvious things
- Generic variable names (result, data, temp, etc)
- Unnatural code patterns
- Educational/explanatory tone in comments
- Too clean, no typos or quick hacks

Respond with ONLY a JSON object:
{
  "isAI": true/false,
  "confidence": 0-100,
  "reasoning": "brief explanation"
}

IMPORTANT: 
- "isAI": true means AI-generated
- "isAI": false means human-written
- "confidence" represents how confident you are in your classification (0-100)`
            },
            {
              role: 'user',
              content: `Language: ${language}\n\nCode:\n\`\`\`${language}\n${code}\n\`\`\``
            }
          ],
          temperature: 0.3,
          max_tokens: 200
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );
      
      const content = response.data.choices[0].message.content;
      
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('❌ ChatGPT response not in JSON format');
        return null;
      }
      
      const result = JSON.parse(jsonMatch[0]);
      
      // CRITICAL FIX: Convert confidence to AI score
      // If isAI = false and confidence = 80, that means 80% confident it's HUMAN
      // So AI score should be 100 - 80 = 20%
      let aiConfidence;
      if (result.isAI) {
        // If classified as AI, use confidence directly
        aiConfidence = result.confidence;
      } else {
        // If classified as Human, invert the confidence
        aiConfidence = 100 - result.confidence;
      }
      
      console.log(`✅ ChatGPT AI detection: ${result.isAI ? 'AI' : 'Human'} (${result.confidence}% confident)`);
      console.log(`   📊 Converted AI score: ${aiConfidence.toFixed(1)}%`);
      
      return {
        isAI: result.isAI,
        confidence: aiConfidence, // Now properly represents AI score
        originalConfidence: result.confidence,
        reasoning: result.reasoning
      };
      
    } catch (error) {
      if (error.response) {
        console.error('❌ ChatGPT API error:', error.response.data);
      } else if (error.code === 'ECONNABORTED') {
        console.error('❌ ChatGPT API timeout');
      } else {
        console.error('❌ ChatGPT detection error:', error.message);
      }
      return null;
    }
  }

  /* ==================== MAIN PLAGIARISM DETECTION ==================== */
  async detectPlagiarism(submissionId) {
    try {
      const currentSubmission = await pool.query(
        `SELECT * FROM submissions WHERE id = $1`,
        [submissionId]
      );
      
      if (currentSubmission.rows.length === 0) {
        throw new Error('Submission not found');
      }
      
      const current = currentSubmission.rows[0];
      
      // 1. PATTERN-BASED AI DETECTION
      console.log('🔍 Running pattern-based AI detection...');
      const aiPatternAnalysis = this.detectAIPatterns(current.code, current.language);
      
      // 2. CHATGPT AI DETECTION
      let gptAnalysis = null;
      const isGPTDetectionEnabled = process.env.ENABLE_GPT_AI_DETECTION === 'true';
      
      if (isGPTDetectionEnabled && process.env.OPENAI_API_KEY) {
        gptAnalysis = await this.detectAIWithChatGPT(current.code, current.language);
      } else if (isGPTDetectionEnabled && !process.env.OPENAI_API_KEY) {
        console.log('⚠️  GPT detection enabled but OPENAI_API_KEY not found');
      }
      
      // 3. COMBINE AI SCORES
      let finalAIScore = aiPatternAnalysis.score;
      let aiReasons = [...aiPatternAnalysis.reasons];
      
      if (gptAnalysis) {
        // Weighted average: 60% pattern-based, 40% ChatGPT
        finalAIScore = (aiPatternAnalysis.score * 0.6) + (gptAnalysis.confidence * 0.4);
        aiReasons.push(`ChatGPT Analysis: ${gptAnalysis.reasoning} (Original: ${gptAnalysis.isAI ? 'AI' : 'Human'} - ${gptAnalysis.originalConfidence}% confident, AI Score: ${gptAnalysis.confidence.toFixed(1)}%)`);
      }
      
      finalAIScore = Math.min(finalAIScore, 100);
      
      // 4. PLAGIARISM DETECTION
      console.log('🔍 Running plagiarism detection...');
      const otherSubmissions = await pool.query(
        `SELECT s.*, u.name as student_name 
         FROM submissions s
         JOIN users u ON s.student_id = u.id
         WHERE s.exam_id = $1 AND s.student_id != $2 AND s.id != $3`,
        [current.exam_id, current.student_id, current.id]
      );
      
      const matches = [];
      let totalSimilarity = 0;
      
      for (const other of otherSubmissions.rows) {
        const similarity = await this.calculateSimilarity(
          current.code,
          other.code,
          current.language,
          other.language
        );
        
        if (similarity > 15) {
          matches.push({
            student_id: other.student_id,
            student_name: other.student_name,
            similarity_score: parseFloat(similarity.toFixed(2)),
            language: other.language,
            submit_time: other.submit_time
          });
          
          totalSimilarity += similarity;
        }
      }
      
      const overallPlagiarismScore = matches.length > 0 
        ? parseFloat((totalSimilarity / matches.length).toFixed(2))
        : 0;
      
      matches.sort((a, b) => b.similarity_score - a.similarity_score);
      
      // 5. STORE REPORT
      const report = await pool.query(
        `INSERT INTO plagiarism_reports 
         (submission_id, overall_similarity_score, matches, ai_detection_score, 
          ai_detection_reasons, analysis_metadata)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          submissionId,
          overallPlagiarismScore,
          JSON.stringify(matches),
          finalAIScore,
          JSON.stringify(aiReasons),
          JSON.stringify({
            total_comparisons: otherSubmissions.rows.length,
            matches_found: matches.length,
            detection_methods: [
              'string_similarity', 'deep_normalization', 'jaccard', 
              'moss_winnowing', 'levenshtein', 'ngram'
            ],
            ai_detection_methods: [
              'entropy', 'perplexity', 'burstiness', 'pattern_analysis',
              'stylometry', 'vocabulary_analysis'
            ].concat(gptAnalysis ? ['chatgpt_gpt4o_mini'] : []),
            ai_metrics: aiPatternAnalysis.metrics,
            chatgpt_analysis: gptAnalysis,
            analyzed_at: new Date().toISOString()
          })
        ]
      );
      
      console.log(`✅ Report generated for submission ${submissionId}`);
      console.log(`   📊 Plagiarism: ${overallPlagiarismScore}%`);
      console.log(`   🤖 AI Detection: ${finalAIScore.toFixed(1)}%`);
      if (gptAnalysis) {
        console.log(`   🧠 ChatGPT: ${gptAnalysis.isAI ? 'AI' : 'Human'} (${gptAnalysis.originalConfidence}% confident) → AI Score: ${gptAnalysis.confidence.toFixed(1)}%`);
        console.log(`   📝 Reasoning: ${gptAnalysis.reasoning}`);
      }
      
      return report.rows[0];
      
    } catch (error) {
      console.error('❌ Detection error:', error);
      throw error;
    }
  }
}

module.exports = new PlagiarismService();