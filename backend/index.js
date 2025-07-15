const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");
const nodemailer = require("nodemailer");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Endpoint ל-AI chat
app.post("/api/ask", async (req, res) => {
  const { question } = req.body;

  try {
    const groqRes = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
          {
            role: "system",
            content:
              "You are chatting with Adir, a Full Stack Developer specializing in React and Node.js. Please answer in a professional and friendly manner.",
          },
          {
            role: "user",
            content: question,
          },
        ],
        max_tokens: 500,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const gptText =
      groqRes.data.choices[0].message?.content || groqRes.data.choices[0].text;

    res.json({ text: gptText });
  } catch (err) {
    console.error("ERROR:", err.response?.data || err.message);
    res.status(500).json({ error: "AI failed to respond" });
  }
});

// הגדרת nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // המייל שלך מתוך .env
    pass: process.env.EMAIL_PASS, // סיסמת אפליקציה או סיסמה רגילה
  },
});

// Endpoint לשליחת טופס יצירת קשר
app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    await transporter.sendMail({
      from: email,
      to: process.env.EMAIL_USER,
      subject: `New contact form submission from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    });

    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
