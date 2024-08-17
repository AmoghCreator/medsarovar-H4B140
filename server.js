require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const OpenAI = require('openai');
const configuration = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAI(configuration);

app.use(express.json());

app.get('/call', async (req, res) => {
  try {
    const response = await axios.post(
      'https://api.callchimp.ai/v1/calls',
      {
        lead: 837491,
      },
      {
        headers: {
          'x-api-key': 'zzTAh5Zs.bv29CY14fzuInRz8lfDWWZfrTTlK68NL',
        },
      },
    );

    res.status(200).send('call done'); // Send back the response from the API
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred'); // Handle errors appropriately
  }
});

app.post('/action', async (req, res) => {
  try {
    let transcript = req.body.data.transcript;
    /* let transcript = [
        {
            "user": "Hi, I need to book a doctor appointment."
        },
        {
            "ai": "Sure, for which date and time would you like to book the appointment?"
        },
        {
            "user": "I need an appointment on 1st July at 10:00 AM."
        },
        {
            "ai": "Got it. I'm checking availability for a doctor on 1st July at 10:00 AM."
        },
        {
            "ai": "Dr. Smith is available on 1st July at 10:00 AM. Shall I book the appointment for you?"
        },
        {
            "user": "Yes, please book it."
        },
        {
            "ai": "Your appointment with Dr. Smith on 1st July at 10:00 AM has been booked. You will receive a confirmation email shortly."
        },
        {
            "user": "Thank you!"
        },
        {
            "ai": "You're welcome! Have a great day!"
        }
    ]  */
    let strigifyTranscript = JSON.stringify(transcript);

    // OpenAI API call
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: `Analyze the following transcript and determine if it is about an appointment. If it is, extract the date and time in the following JSON format 
            {appointmentAccepted:Boolean, dateandtime : String} \nTranscript: ${strigifyTranscript}`,
        },
      ],
    });

    // Process the response from OpenAI API
    const analysis = response.choices[0].message.content;

    console.log(analysis);
    // Example: Assume the response is formatted as JSON with fields appointment and dateAndTime
    let analysisResult = JSON.parse(analysis);
    analysisResult['chat_id'] = '761762992';
    console.log(analysisResult)
    await axios.post(
      'http://pggswcscwkok0o8s8gwk48o8.5.223.44.80.sslip.io/sendAppointment',
      analysisResult,
    );

    // Send the response back
    res.json({
      appointment: analysisResult.appointment,
      dateAndTime: analysisResult.dateandtime,
      chat_id: analysisResult.chat_id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error analyzing transcript');
  }
});

// Make sure the app listens on a port
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
