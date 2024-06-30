# MedSarovar: Your One-Stop Shop for Affordable Healthcare (README.md)

MedSarovar is a Telegram Bot that empowers users in India to navigate the healthcare landscape with ease. Our AI-powered platform tackles common pain points by helping users:
 - Find Budget-Friendly Specialists: Get matched with doctors who fit your budget and address your specific needs.
 - Skip the Wait: Effortlessly book and manage appointments, saving you valuable time.
 - Get the Right Care: Securely share medical records with doctors for a seamless flow of information and a more accurate diagnosis.

# MedSarovar simplifies your healthcare journey:
 - AI-powered Doctor Matching: Our AI engine matches you with the best-suited doctor based on your budget and symptoms. 🩺₹
 - Effortless Appointment Booking: Manage appointments directly through the app, saving you time and hassle. ⏱️
 - Secure Medical Record Sharing: Share medical records securely with your doctor, ensuring continuity of care.

# Tech Stack:
 - Artificial Intelligence: Utilizes machine learning algorithms for doctor matching.
 - Cloud Platform: Built on a secure and scalable cloud infrastructure.
 - Mobile App Development: Native apps for Android and iOS platforms.
 - Secure Communication: Encrypted messaging protects user privacy.

## Features

- Collects user information (name, age, phone number, maximum budget).
- Analyzes user symptoms using OpenAI's GPT-3.5-turbo model.
- Recommends doctors based on the diagnosis and user's budget.
- Allows users to book appointments with recommended doctors.
- Communicates with an external API to handle appointment bookings.

## Prerequisites

- Node.js and npm installed
- MongoDB for storing user data and doctor information
- A Telegram bot token from BotFather
- OpenAI API key

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/telegram-medical-assistant-bot.git
   cd telegram-medical-assistant-bot
   ```

2. Install the dependencies:
   ```sh
   npm install
   ```

3. Create a `.env` file in the root directory and add your credentials:
   ```sh
   TELEGRAM_BOT_TOKEN=your-telegram-bot-token
   OPENAI_API_KEY=your-openai-api-key
   MONGODB_URI=your-mongodb-uri
   ```

4. Start the bot:
   ```sh
   node index.js
   ```

## Usage

1. Start the bot by sending `/start` in your Telegram chat.
2. Follow the prompts to provide your name, age, phone number, and maximum budget.
3. Describe the symptoms you are experiencing.
4. The bot will provide a possible diagnosis and recommend doctors.
5. Select a doctor to book an appointment.

## API Integration

The bot communicates with an external API to handle appointment bookings. Ensure your API endpoint is correctly configured in the code:
   ```javascript
   const response = await axios.post('https://hack4bengal-427819.el.r.appspot.com/call', {
     doctorId: selectedDoctor._id,
     chatId: chatId
   });
   ```

## Demo

Watch the [YouTube demo](#) to see the bot in action.

## Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Open a pull request.

## License

This project is licensed under the MIT License.
