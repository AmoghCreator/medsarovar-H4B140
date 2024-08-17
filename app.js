require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const OpenAI = require('openai');
const {connect} = require('./db/connect');
const {Doctor} = require('./schema/doctors');
const {User} = require('./schema/user');
const {Appointment} = require('./schema/appointment');
const express = require('express');
const app = express();
const axios = require('axios');
app.use(express.json());

connect();

// Load environment variables
const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
const openaiApiKey = process.env.OPENAI_API_KEY;

// Initialize Telegram bot
const bot = new TelegramBot(telegramToken, {polling: true});

// Initialize OpenAI API
const configuration = new OpenAI({
  apiKey: openaiApiKey,
});
const openai = new OpenAI(configuration);

// Store user context data
const userContext = {};

const {CampaignsApi, Configuration} = require('@dynopii/callchimp');

const config = new Configuration({
  basePath: 'https://api.callchimp.ai/dev',
  apiKey: 'VOBZcmXn.7NT7UN2dFqA4jnUZQrk9G2y5KswQXe3H',
});

const campaignsApi = new CampaignsApi(config);

app.get('/', (req, res) => res.send("hello"));

app.post('/sendAppointment', async (req, res) => {
  console.log('req received');
  let user = await User.findOne({chat_id: '761762992'});
  await Appointment.create({
    name: user.name,
    dateandtime: req.body.dateandtime,
  });
  bot.sendMessage(761762992, `your booking is on ${req.body.dateandtime}`);
  res.send(req.body);
});

// Handle /start command
bot.onText(/\/start/, async msg => {
  const chatId = msg.chat.id;
  let user = await User.findOne({chat_id: chatId});

  if (!user) {
    bot.sendMessage(chatId, 'Please provide your name');
    userContext[chatId] = {state: 'awaiting_name'};
  } else {
    bot.sendMessage(chatId, `Welcome back, ${user.name}`);
  }
});

// Handle incoming messages
bot.on('message', async msg => {
  const chatId = msg.chat.id;
  const userMessage = msg.text;

  if (!userContext[chatId]) {
    // If user context is not set, ignore or prompt them to use /start
    return;
  }

  const userState = userContext[chatId].state;

  switch (userState) {
    case 'awaiting_name':
      userContext[chatId].name = userMessage;
      userContext[chatId].state = 'awaiting_age';
      bot.sendMessage(chatId, 'Please provide your age');
      break;

    case 'awaiting_age':
      userContext[chatId].age = userMessage;
      userContext[chatId].state = 'awaiting_phone';
      bot.sendMessage(chatId, 'Please provide your phone number');
      break;

    case 'awaiting_phone':
      userContext[chatId].phone = userMessage;
      userContext[chatId].state = 'awaiting_budget';
      bot.sendMessage(
        chatId,
        "Please provide the maximum amount you can spend on a doctor's visit",
      );
      break;

    case 'awaiting_budget':
      userContext[chatId].budget = userMessage;
      const {name, age, phone, budget} = userContext[chatId];

      // Save user data to the database
      await User.create({
        chat_id: chatId,
        name: name,
        age: age,
        phone: phone,
        budget: budget,
      });

      bot.sendMessage(
        chatId,
        `Thank you, ${name}. Your details have been recorded.`,
      );
      delete userContext[chatId]; // Clear the context after completing the conversation
      break;

    default:
      // Handle any other states or reset the conversation
      bot.sendMessage(chatId, 'Please use /start to begin.');
      delete userContext[chatId];
      break;
  }
});

// Handle incoming messages for initial diagnosis and doctor selection
bot.on('message', async msg => {
  const chatId = msg.chat.id;
  const userMessage = msg.text;

  // Avoid processing /start command again
  if (userMessage.startsWith('/start')) return;

  // Check if the user is in the initial diagnosis state
  if (!userContext[chatId] || userContext[chatId] === 'initial') {
    // Capture the user's issue
    userContext[chatId] = 'processing';

    try {
      // Send two requests to OpenAI API
      const diagnosisResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: `Please provide a possible diagnosis for the following symptoms: ${userMessage}`,
          },
        ],
      });

      const specialtyResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: `Which medical specialty is required for the following symptoms: ${userMessage}`,
          },
        ],
      });

      const diagnosis = diagnosisResponse.choices[0].message.content;
      const specialty = specialtyResponse.choices[0].message.content;
      console.log(diagnosis);
      console.log(specialty);

      // Send the possible diagnosis back to the user
      bot.sendMessage(chatId, `Possible diagnosis: ${diagnosis}`);

      // Query the doctor database by specialty
      const doctors = await queryDoctorsBySpecialty(specialty);
      const doctorOptions = doctors.map((doctor, index) => ({
        text: ` ${doctor.doctorName}, ${doctor.speciality}`,
        callback_data: `doctor_${index}`,
      }));

      // Add a Cancel button to the options
      doctorOptions.push({text: 'Cancel', callback_data: 'cancel'});

      // Send doctor options to the user
      const options = {
        reply_markup: {
          inline_keyboard: doctorOptions.map(option => [option]),
        },
      };

      bot.sendMessage(
        chatId,
        'Here are some doctors you can book an appointment with:',
        options,
      );

      // Store doctors in user context for later use
      userContext[chatId] = {
        state: 'selecting_doctor',
        doctors: doctors,
      };
    } catch (error) {
      console.error('Error while calling OpenAI API:', error);
      bot.sendMessage(
        chatId,
        'Sorry, something went wrong. Please try again later.',
      );
    }
  }
});

// Handle callback queries from inline keyboards
bot.on('callback_query', async callbackQuery => {
  const message = callbackQuery.message;
  const chatId = message.chat.id;
  const data = callbackQuery.data;

  // Check if the user is selecting a doctor or cancelling
  if (userContext[chatId] && userContext[chatId].state === 'selecting_doctor') {
    if (data === 'cancel') {
      bot.sendMessage(chatId, 'Operation cancelled.');
      userContext[chatId] = 'initial';
      return;
    }

    const selectedDoctorIndex = parseInt(data.split('_')[1]);
    const selectedDoctor = userContext[chatId].doctors[selectedDoctorIndex];

    bot.sendMessage(
      chatId,
      `You selected  ${selectedDoctor.doctorName}. Booking an appointment...`,
    );

    // Handle the booking process and make the API call
    try {
      const response = await axios.get(
        'https://hack4bengal-427819.el.r.appspot.com/call',
        {
          doctorId: selectedDoctor._id,
          chatId: chatId,
        },
      );

      if (response.status === 200) {
      } else {
        bot.sendMessage(
          chatId,
          `Failed to book appointment with  ${selectedDoctor.doctorName}. Please try again.`,
        );
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      bot.sendMessage(
        chatId,
        `Error booking appointment with  ${selectedDoctor.doctorName}. Please try again later.`,
      );
    }
  }
});

// Dummy function to query doctors by specialty
async function queryDoctorsBySpecialty(specialty) {
  const docData = await Doctor.find({speciality: specialty});
  console.log(docData);
  return docData;
}

// Dummy function to book an appointment (not used now, handled by API call)
function bookAppointment(doctor, chatId) {
  bot.sendMessage(chatId, `Appointment booked with  ${doctor.doctorName}.`);
}

app.listen(3000, () => console.log('Done Man'));
