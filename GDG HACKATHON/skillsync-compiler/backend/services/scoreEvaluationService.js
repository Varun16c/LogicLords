const pool = require('../db');
const axios = require('axios');

class ScoreEvaluationService {
  
  constructor() {
    this.OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  }

  /* ==================== OUTPUT NORMALIZATION ==================== */
  /**
   * Normalizes output strings for flexible comparison
   * Handles: case differences, extra whitespace, punctuation variations
   */
  normalizeOutput(output) {
    if (!output) return '';
    
    return output
      .toString()
      .trim()                          // Remove leading/trailing whitespace
      .toLowerCase()                    // Convert to lowercase
      .replace(/\s+/g, ' ')            // Normalize multiple spaces to single space
      .replace(/[.,!?;:'"]/g, '')      // Remove common punctuation
      .replace(/\n+/g, '\n')           // Normalize multiple newlines
      .trim();
  }

  /**
   * Advanced comparison that handles ALL minor formatting differences
   * Works for: case, spacing, punctuation, word order in simple cases
   */
  compareOutputs(actual, expected) {
    // Handle null/undefined
    if (!actual && !expected) return true;
    if (!actual || !expected) return false;
    
    const normalizedActual = this.normalizeOutput(actual);
    const normalizedExpected = this.normalizeOutput(expected);
    
    console.log('🔍 Comparing outputs:');
    console.log('   Expected:', expected, '→', normalizedExpected);
    console.log('   Actual:', actual, '→', normalizedActual);
    
    // 1. Exact match after normalization (handles 99% of cases)
    if (normalizedActual === normalizedExpected) {
      console.log('   ✅ Exact match after normalization');
      return true;
    }
    
    // 2. Remove ALL whitespace and compare (handles extra spaces)
    const compactActual = normalizedActual.replace(/\s/g, '');
    const compactExpected = normalizedExpected.replace(/\s/g, '');
    if (compactActual === compactExpected) {
      console.log('   ✅ Match after removing all spaces');
      return true;
    }
    
    // 3. For numeric outputs, compare as numbers with tolerance
    const actualNum = parseFloat(normalizedActual);
    const expectedNum = parseFloat(normalizedExpected);
    if (!isNaN(actualNum) && !isNaN(expectedNum)) {
      const match = Math.abs(actualNum - expectedNum) < 0.0001;
      if (match) {
        console.log('   ✅ Numeric match:', actualNum, '≈', expectedNum);
        return true;
      }
    }
    
    // 4. Try comparing as arrays/lists (for multi-line or comma-separated outputs)
    const actualLines = normalizedActual.split(/[\n,]/).map(s => s.trim()).filter(Boolean).sort();
    const expectedLines = normalizedExpected.split(/[\n,]/).map(s => s.trim()).filter(Boolean).sort();
    if (actualLines.length === expectedLines.length && 
        actualLines.every((line, i) => line === expectedLines[i])) {
      console.log('   ✅ Match as sorted arrays');
      return true;
    }
    
    // 5. Check if one is substring of other (for partial matches)
    // This is more lenient - use with caution
    if (compactActual.includes(compactExpected) || compactExpected.includes(compactActual)) {
      const lengthRatio = Math.min(compactActual.length, compactExpected.length) / 
                         Math.max(compactActual.length, compactExpected.length);
      // If they're at least 90% similar in length, accept it
      if (lengthRatio >= 0.9) {
        console.log('   ✅ Substring match with high similarity');
        return true;
      }
    }
    
    console.log('   ❌ No match found');
    return false;
  }

  /* ==================== TEST CASE EXECUTION ==================== */
  async executeTestCases(code, language, testCases) {
    const results = [];
    let passedCount = 0;

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      
      try {
        // Call your Judge0 compiler endpoint
        const response = await axios.post('http://localhost:5000/run', {
          code,
          language,
          input: testCase.input
        }, { timeout: 10000 });

        const output = response.data.output?.trim();
        const expectedOutput = testCase.output?.trim();
        
        // Use smart comparison instead of strict equality
        const passed = this.compareOutputs(output, expectedOutput);

        if (passed) passedCount++;

        results.push({
          test_case: i + 1,
          input: testCase.input,
          expected: expectedOutput,
          actual: output,
          passed,
          error: null,
          // Store normalized versions for debugging
          normalized_expected: this.normalizeOutput(expectedOutput),
          normalized_actual: this.normalizeOutput(output)
        });

      } catch (error) {
        results.push({
          test_case: i + 1,
          input: testCase.input,
          expected: testCase.output,
          actual: null,
          passed: false,
          error: error.message || 'Execution failed'
        });
      }
    }

    return {
      results,
      passedCount,
      totalCount: testCases.length,
      passPercentage: testCases.length > 0 ? (passedCount / testCases.length) * 100 : 0
    };
  }

  /* ==================== AI-BASED CODE QUALITY & LOGIC EVALUATION ==================== */
  async evaluateCodeWithAI(code, language, question, testCases) {
    if (!this.OPENAI_API_KEY) {
      console.log('⚠️ AI evaluation skipped: No OpenAI API key');
      return {
        logicScore: 50,
        qualityScore: 50,
        reasoning: 'AI evaluation unavailable - using default scores'
      };
    }

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are a code evaluation expert. Analyze the submitted code and provide scores.

Evaluate TWO aspects:

1. **LOGIC CORRECTNESS (0-100)**: Does the code's approach and algorithm align with the question requirements? Would it theoretically solve the problem correctly?

2. **CODE QUALITY (0-100)**: Assess:
   - Clean, readable code structure
   - Proper variable naming
   - Efficient algorithms (time/space complexity)
   - Error handling
   - Best practices for the language

Respond with ONLY a JSON object:
{
  "logicScore": 0-100,
  "qualityScore": 0-100,
  "reasoning": "brief explanation of your evaluation"
}`
            },
            {
              role: 'user',
              content: `**Question:**
${question}

**Test Cases:**
${JSON.stringify(testCases, null, 2)}

**Submitted Code (${language}):**
\`\`\`${language}
${code}
\`\`\`

Evaluate the logic correctness and code quality.`
            }
          ],
          temperature: 0.3,
          max_tokens: 500
        },
        {
          headers: {
            'Authorization': `Bearer ${this.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 20000
        }
      );

      const content = response.data.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('Invalid AI response format');
      }

      const result = JSON.parse(jsonMatch[0]);
      
      console.log(`✅ AI Evaluation: Logic=${result.logicScore}%, Quality=${result.qualityScore}%`);
      
      return {
        logicScore: Math.min(Math.max(result.logicScore, 0), 100),
        qualityScore: Math.min(Math.max(result.qualityScore, 0), 100),
        reasoning: result.reasoning
      };

    } catch (error) {
      console.error('❌ AI evaluation error:', error.message);
      return {
        logicScore: 50,
        qualityScore: 50,
        reasoning: 'AI evaluation failed - using default scores'
      };
    }
  }

  /* ==================== CALCULATE FINAL SCORE ==================== */
  async calculateScore(submissionId) {
    try {
      console.log(`\n📊 Starting score evaluation for submission ${submissionId}...`);

      // 1. GET SUBMISSION AND EXAM DATA
      const submissionResult = await pool.query(
        `SELECT s.*, e.question, e.test_cases, e.marks, e.solution
         FROM submissions s
         JOIN exams e ON s.exam_id = e.id
         WHERE s.id = $1`,
        [submissionId]
      );

      if (submissionResult.rows.length === 0) {
        throw new Error('Submission not found');
      }

      const submission = submissionResult.rows[0];
      const totalMarks = submission.marks;
      const testCases = submission.test_cases;

      // 2. GET PLAGIARISM REPORT
      const reportResult = await pool.query(
        `SELECT * FROM plagiarism_reports WHERE submission_id = $1`,
        [submissionId]
      );

      const plagiarismReport = reportResult.rows[0];

      if (!plagiarismReport) {
        console.log('⚠️ Plagiarism report not ready, score evaluation deferred');
        return null;
      }

      const plagiarismScore = parseFloat(plagiarismReport.overall_similarity_score) || 0;
      const aiDetectionScore = parseFloat(plagiarismReport.ai_detection_score) || 0;
      const tabSwitchCount = submission.tab_switch_count || 0;

      // 3. EXECUTE TEST CASES
      console.log('🧪 Executing test cases...');
      const testResults = await this.executeTestCases(
        submission.code,
        submission.language,
        testCases
      );

      // 4. AI-BASED CODE EVALUATION
      console.log('🤖 Running AI code evaluation...');
      const aiEvaluation = await this.evaluateCodeWithAI(
        submission.code,
        submission.language,
        submission.question,
        testCases
      );

      // 5. CALCULATE COMPONENT SCORES
      const breakdown = this.calculateBreakdown(
        totalMarks,
        testResults,
        aiEvaluation,
        plagiarismScore,
        aiDetectionScore,
        tabSwitchCount
      );

      // 6. SAVE SCORES TO DATABASE
      await pool.query(
        `UPDATE submissions 
         SET total_score = $1, 
             score_breakdown = $2, 
             test_results = $3,
             evaluated_at = NOW()
         WHERE id = $4`,
        [
          breakdown.totalScore,
          JSON.stringify(breakdown),
          JSON.stringify(testResults),
          submissionId
        ]
      );

      console.log(`\n✅ Score Evaluation Complete!`);
      console.log(`   📊 Total Score: ${breakdown.totalScore.toFixed(2)}/${totalMarks}`);
      console.log(`   ✓ Performance Score: ${breakdown.performanceScore.toFixed(2)} (Tests + Logic + Quality)`);
      console.log(`   🎁 Bonus Marks: +${breakdown.totalBonus.toFixed(2)} (Good behavior reward)`);
      console.log(`      ├─ Plagiarism Bonus: +${breakdown.plagiarismBonus.toFixed(2)}`);
      console.log(`      ├─ AI Detection Bonus: +${breakdown.aiBonus.toFixed(2)}`);
      console.log(`      └─ Tab Switch Bonus: +${breakdown.tabSwitchBonus.toFixed(2)}\n`);

      return breakdown;

    } catch (error) {
      console.error('❌ Score evaluation error:', error);
      throw error;
    }
  }

  /* ==================== BREAKDOWN CALCULATION LOGIC ==================== */
  calculateBreakdown(totalMarks, testResults, aiEvaluation, plagiarismScore, aiDetectionScore, tabSwitchCount) {
    
    // COMPONENT WEIGHTAGES (customizable based on total marks)
    const weights = {
      testCases: 0.50,        // 50% - Test case pass rate
      codeLogic: 0.10,        // 10% - AI logic evaluation
      codeQuality: 0.10,      // 10% - AI code quality
      plagiarismPenalty: 0.15,    // 15% - Plagiarism penalty allocation
      aiPenalty: 0.10,        // 10% - AI detection penalty allocation
      tabSwitchPenalty: 0.05  // 5% - Tab switch penalty allocation
    };

    // 1. TEST CASE SCORE (50%)
    const testCaseMaxMarks = totalMarks * weights.testCases;
    const testCaseScore = (testResults.passPercentage / 100) * testCaseMaxMarks;

    // 2. CODE LOGIC SCORE (10%)
    const codeLogicMaxMarks = totalMarks * weights.codeLogic;
    const codeLogicScore = (aiEvaluation.logicScore / 100) * codeLogicMaxMarks;

    // 3. CODE QUALITY SCORE (10%)
    const codeQualityMaxMarks = totalMarks * weights.codeQuality;
    const codeQualityScore = (aiEvaluation.qualityScore / 100) * codeQualityMaxMarks;

    // 4. PLAGIARISM PENALTY (up to 15%)
    const plagiarismMaxPenalty = totalMarks * weights.plagiarismPenalty;
    const plagiarismDeduction = (plagiarismScore / 100) * plagiarismMaxPenalty;
    // BONUS: If student has low plagiarism, they get the unused penalty allocation as bonus
    const plagiarismBonus = plagiarismMaxPenalty - plagiarismDeduction;

    // 5. AI DETECTION PENALTY (up to 10%)
    const aiMaxPenalty = totalMarks * weights.aiPenalty;
    const aiDeduction = (aiDetectionScore / 100) * aiMaxPenalty;
    // BONUS: If student has low AI detection, they get the unused penalty allocation as bonus
    const aiBonus = aiMaxPenalty - aiDeduction;

    // 6. TAB SWITCH PENALTY (up to 5%)
    const tabSwitchMaxPenalty = totalMarks * weights.tabSwitchPenalty;
    // Penalty increases with tab switches: 0 switches = 0%, 5+ switches = 100% penalty
    const tabSwitchPenaltyPercent = Math.min((tabSwitchCount / 5) * 100, 100);
    const tabSwitchDeduction = (tabSwitchPenaltyPercent / 100) * tabSwitchMaxPenalty;
    // BONUS: If student has few/no tab switches, they get the unused penalty allocation as bonus
    const tabSwitchBonus = tabSwitchMaxPenalty - tabSwitchDeduction;

    // ========== FINAL CALCULATION WITH BONUS SYSTEM ==========
    // IMPORTANT: We ADD bonuses for good behavior, not subtract penalties!
    
    // Step 1: Calculate performance score (tests + logic + quality)
    const performanceScore = testCaseScore + codeLogicScore + codeQualityScore;
    
    // Step 2: Calculate bonus marks from unused penalty allocations
    const totalBonus = plagiarismBonus + aiBonus + tabSwitchBonus;
    
    // Step 3: Final score = performance + bonus (capped at total marks available)
    const totalScore = Math.min(performanceScore + totalBonus, totalMarks);
    
    console.log('\n BONUS SYSTEM CALCULATION:');
    console.log(`   Performance Score: ${performanceScore.toFixed(2)}`);
    console.log(`   + Plagiarism Bonus: ${plagiarismBonus.toFixed(2)} (${plagiarismMaxPenalty} - ${plagiarismDeduction})`);
    console.log(`   + AI Bonus: ${aiBonus.toFixed(2)} (${aiMaxPenalty} - ${aiDeduction})`);
    console.log(`   + Tab Switch Bonus: ${tabSwitchBonus.toFixed(2)} (${tabSwitchMaxPenalty} - ${tabSwitchDeduction})`);
    console.log(`   = TOTAL BONUS: +${totalBonus.toFixed(2)}`);
    console.log(`   = FINAL SCORE: ${totalScore.toFixed(2)}/${totalMarks}`);

    return {
      totalScore: parseFloat(totalScore.toFixed(2)),
      maxMarks: totalMarks,
      
      // Component breakdown
      testCaseScore: parseFloat(testCaseScore.toFixed(2)),
      testCaseMaxMarks: parseFloat(testCaseMaxMarks.toFixed(2)),
      testCasesPassed: testResults.passedCount,
      testCasesTotal: testResults.totalCount,
      testCasePassPercentage: parseFloat(testResults.passPercentage.toFixed(2)),
      
      codeLogicScore: parseFloat(codeLogicScore.toFixed(2)),
      codeLogicMaxMarks: parseFloat(codeLogicMaxMarks.toFixed(2)),
      codeLogicPercentage: aiEvaluation.logicScore,
      
      codeQualityScore: parseFloat(codeQualityScore.toFixed(2)),
      codeQualityMaxMarks: parseFloat(codeQualityMaxMarks.toFixed(2)),
      codeQualityPercentage: aiEvaluation.qualityScore,
      
      // Performance score (before bonuses)
      performanceScore: parseFloat(performanceScore.toFixed(2)),
      
      // Bonus system (unused penalty allocations)
      plagiarismBonus: parseFloat(plagiarismBonus.toFixed(2)),
      aiBonus: parseFloat(aiBonus.toFixed(2)),
      tabSwitchBonus: parseFloat(tabSwitchBonus.toFixed(2)),
      totalBonus: parseFloat(totalBonus.toFixed(2)),
      
      // Deductions (for reference)
      plagiarismDeduction: parseFloat(plagiarismDeduction.toFixed(2)),
      plagiarismMaxPenalty: parseFloat(plagiarismMaxPenalty.toFixed(2)),
      plagiarismPercentage: plagiarismScore,
      
      aiDeduction: parseFloat(aiDeduction.toFixed(2)),
      aiMaxPenalty: parseFloat(aiMaxPenalty.toFixed(2)),
      aiDetectionPercentage: aiDetectionScore,
      
      tabSwitchDeduction: parseFloat(tabSwitchDeduction.toFixed(2)),
      tabSwitchMaxPenalty: parseFloat(tabSwitchMaxPenalty.toFixed(2)),
      tabSwitchCount: tabSwitchCount,
      tabSwitchPenaltyPercent: parseFloat(tabSwitchPenaltyPercent.toFixed(2)),
      
      // AI reasoning
      aiReasoning: aiEvaluation.reasoning,
      
      // Calculated at
      evaluatedAt: new Date().toISOString()
    };
  }
}

module.exports = new ScoreEvaluationService();