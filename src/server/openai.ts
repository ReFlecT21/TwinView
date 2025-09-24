import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function generateCompetitiveAnalysis(companyName: string, industry: string, digitalTwinStatus: string): Promise<string> {
  try {
    const prompt = `Analyze the competitive landscape and Dell's positioning opportunity for ${companyName}, a ${industry} company with digital twin status: ${digitalTwinStatus}.

Please provide a comprehensive competitive analysis including:
1. Current digital twin technology stack they likely use
2. Key competitors in their digital twin space
3. Dell's specific competitive advantages and positioning opportunities
4. Recommended approach strategy
5. Potential challenges and how to overcome them

Respond with a detailed analysis in JSON format with the following structure:
{
  "currentTechStack": "description of likely current technology stack",
  "keyCompetitors": ["list of main competitors"],
  "dellAdvantages": ["list of Dell's competitive advantages"],
  "recommendedStrategy": "detailed strategy recommendation",
  "challenges": ["list of potential challenges"],
  "solutions": ["corresponding solutions to challenges"]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a competitive intelligence analyst specializing in digital twin technology and enterprise infrastructure solutions. Provide detailed, actionable insights for Dell's sales strategy."
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return `**Current Technology Stack**: ${result.currentTechStack}

**Key Competitors**: ${result.keyCompetitors?.join(', ')}

**Dell's Competitive Advantages**:
${result.dellAdvantages?.map((adv: string) => `• ${adv}`).join('\n')}

**Recommended Strategy**: ${result.recommendedStrategy}

**Potential Challenges & Solutions**:
${result.challenges?.map((challenge: string, index: number) => 
  `• **Challenge**: ${challenge}\n  **Solution**: ${result.solutions?.[index] || 'Develop mitigation strategy'}`
).join('\n')}`;

  } catch (error) {
    throw new Error("Failed to generate competitive analysis: " + (error as Error).message);
  }
}

export async function generateOpportunityAssessment(companyName: string, industry: string, revenue: string, digitalTwinMaturity: number, employees?: number): Promise<{
  opportunityScore: number;
  assessmentNotes: string;
  estimatedDealValue: string;
  painPoints: Array<{title: string; description: string}>;
  dellSolutions: Array<{title: string; description: string}>;
  nextSteps: Array<{title: string; description: string}>;
}> {
  try {
    const prompt = `Assess the comprehensive Dell sales opportunity for ${companyName}, a ${industry} company with revenue of ${revenue}, ${employees || 'unknown'} employees, and current digital twin maturity of ${digitalTwinMaturity}%.

Provide a complete opportunity analysis including:
1. Opportunity score (1-100) based on potential value as Dell customer
2. Estimated deal value in USD (realistic range based on company size)
3. Key pain points they likely face (3-5 specific challenges)
4. Recommended Dell solutions with details (3-5 solutions)
5. Next steps for engagement (3-5 actionable steps)
6. Detailed assessment notes

Respond in JSON format:
{
  "opportunityScore": number (1-100),
  "estimatedDealValue": "USD amount or range (e.g. '$2-5M', '$500K-1M')",
  "assessmentNotes": "detailed explanation of scoring and recommendations",
  "painPoints": [
    {"title": "pain point title", "description": "detailed description of the challenge"},
    {"title": "another pain point", "description": "detailed description"}
  ],
  "dellSolutions": [
    {"title": "Dell solution name", "description": "how this solution addresses their needs"},
    {"title": "another solution", "description": "detailed benefits"}
  ],
  "nextSteps": [
    {"title": "immediate action", "description": "what to do first"},
    {"title": "follow-up step", "description": "next action to take"}
  ],
  "productRecommendations": ["list of specific Dell products/solutions"],
  "timelineRecommendation": "suggested engagement timeline"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a senior Dell Technologies sales opportunity analyst specializing in enterprise digital transformation and infrastructure solutions. Provide actionable, industry-specific assessments."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    const assessmentNotes = `**Opportunity Assessment**: ${result.assessmentNotes}

**Recommended Dell Solutions**:
${result.productRecommendations?.map((product: string) => `• ${product}`).join('\n')}

**Engagement Timeline**: ${result.timelineRecommendation}`;

    return {
      opportunityScore: Math.max(1, Math.min(100, result.opportunityScore || 50)),
      assessmentNotes,
      estimatedDealValue: result.estimatedDealValue || 'TBD',
      painPoints: result.painPoints || [
        {title: "Digital Infrastructure Gap", description: "Legacy systems limiting digital transformation"},
        {title: "Scalability Challenges", description: "Current infrastructure cannot support growth requirements"}
      ],
      dellSolutions: result.dellSolutions || [
        {title: "PowerEdge Server Portfolio", description: "High-performance computing infrastructure for enterprise workloads"},
        {title: "Storage Solutions", description: "Scalable storage systems for data-intensive applications"}
      ],
      nextSteps: result.nextSteps || [
        {title: "Technical Discovery", description: "Schedule detailed technical assessment meeting"},
        {title: "Solution Architecture", description: "Design preliminary infrastructure roadmap"}
      ]
    };

  } catch (error) {
    throw new Error("Failed to generate opportunity assessment: " + (error as Error).message);
  }
}

export async function generateDigitalTwinStrategy(companyName: string, industry: string, businessAreas: string[], employees?: number): Promise<{
  strategyAnalysis: string;
  maturityScore: number;
  status: 'not_started' | 'researching' | 'implementing' | 'completed';
  keyInitiatives: string[];
  recommendations: Array<{title: string; description: string}>;
}> {
  try {
    const prompt = `Analyze the digital twin strategy for ${companyName}, a ${industry} company with business areas: ${businessAreas.join(', ')} and ${employees || 'unknown'} employees.

Provide comprehensive strategic insights including:
1. Current digital twin maturity assessment (0-100%)
2. Implementation status recommendation
3. Key strategic initiatives they should focus on
4. Specific recommendations with titles and descriptions
5. Detailed strategy analysis

Respond in JSON format:
{
  "currentInitiatives": "description of likely current digital twin efforts",
  "strategicPriorities": ["list of strategic priorities"],
  "technologyChallenges": ["list of technical challenges"],
  "growthOpportunities": ["list of growth opportunities"],
  "industryCases": ["industry-specific use cases"],
  "maturityScore": number (0-100),
  "recommendedStatus": "not_started|researching|implementing|completed",
  "keyInitiatives": ["list of 3-5 key initiatives they should focus on"],
  "recommendations": [
    {"title": "recommendation title", "description": "detailed description"},
    {"title": "another title", "description": "detailed description"}
  ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a digital twin strategy consultant with deep expertise in enterprise digital transformation. Provide actionable, industry-specific recommendations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    const strategyAnalysis = `**Current Digital Twin Initiatives**: ${result.currentInitiatives}

**Strategic Priorities**:
${result.strategicPriorities?.map((priority: string) => `• ${priority}`).join('\n')}

**Technology Challenges**:
${result.technologyChallenges?.map((challenge: string) => `• ${challenge}`).join('\n')}

**Growth Opportunities**:
${result.growthOpportunities?.map((opportunity: string) => `• ${opportunity}`).join('\n')}

**Industry-Specific Use Cases**:
${result.industryCases?.map((useCase: string) => `• ${useCase}`).join('\n')}`;

    return {
      strategyAnalysis,
      maturityScore: Math.max(0, Math.min(100, result.maturityScore || 25)),
      status: ['not_started', 'researching', 'implementing', 'completed'].includes(result.recommendedStatus)
        ? result.recommendedStatus
        : 'researching',
      keyInitiatives: result.keyInitiatives || [],
      recommendations: result.recommendations || [
        {title: "Industry Focus", description: `${industry}-specific solutions`},
        {title: "Scale Factor", description: `${employees ? employees.toLocaleString() + " employee" : "Enterprise"} implementation`}
      ]
    };

  } catch (error) {
    throw new Error("Failed to generate digital twin strategy: " + (error as Error).message);
  }
}
