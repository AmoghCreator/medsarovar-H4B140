const {
    FunctionDeclarationSchemaType,
    HarmBlockThreshold,
    HarmCategory,
    VertexAI
  } = require('@google-cloud/vertexai');
  
  const project = 'Hack4Bengal';
  const location = 'ap-south-1';
  const textModel = 'gemini-1.0-pro';
  const visionModel = 'gemini-1.0-pro-vision';
  
  const vertexAI = new VertexAI({ project: project, location: location });
  
  // Instantiate Gemini models
  const generativeModel = vertexAI.getGenerativeModel({
    model: textModel,
    safetySettings: [{ category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE }],
    generationConfig: { maxOutputTokens: 256 },
  });
  
  const generativeVisionModel = vertexAI.getGenerativeModel({
    model: visionModel,
  });
  
  const generativeModelPreview = vertexAI.preview.getGenerativeModel({
    model: textModel,
  });
  
  async function streamGenerateContent() {
    const request = {
      contents: [{ role: 'user', parts: [{ text: 'How are you doing today?' }] }],
    };
  
    try {
      const streamingResult = await generativeModel.generateContentStream(request);
      for await (const item of streamingResult.stream) {
        console.log('stream chunk: ', JSON.stringify(item));
      }
      const aggregatedResponse = await streamingResult.response;
      console.log('aggregated response: ', JSON.stringify(aggregatedResponse));
    } catch (error) {
      if (error.response && error.response.headers['content-type'] && error.response.headers['content-type'].includes('text/html')) {
        const errorMessage = await error.response.text();
        console.error('Received HTML error:', errorMessage);
      } else {
        console.error('Error generating content:', error);
      }
    }
  }
  
  streamGenerateContent();
  