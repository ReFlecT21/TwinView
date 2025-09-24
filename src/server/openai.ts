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

export async function generateOpportunityAssessment(companyName: string, industry: string, revenue: string, digitalTwinMaturity: number): Promise<{
  opportunityScore: number;
  assessmentNotes: string;
}> {
  try {
    const prompt = `Assess the Dell sales opportunity for ${companyName}, a ${industry} company with revenue of ${revenue} and current digital twin maturity of ${digitalTwinMaturity}%.

Please provide:
1. An opportunity score from 1-100 based on their potential value as a Dell customer
2. Detailed assessment notes explaining the scoring rationale
3. Specific product/solution recommendations
4. Timeline recommendations for engagement

Respond in JSON format:
{
  "opportunityScore": number,
  "assessmentNotes": "detailed explanation of scoring and recommendations",
  "productRecommendations": ["list of Dell products/solutions"],
  "timelineRecommendation": "suggested engagement timeline"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a sales opportunity assessment specialist for Dell Technologies, focused on digital twin and infrastructure solutions."
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
      assessmentNotes
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
