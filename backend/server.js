const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { MongoClient, ObjectId, MongoCryptKMSRequestNetworkTimeoutError } = require("mongodb");
const winston = require("winston");
const bcrypt = require("bcrypt");
require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const { execSync } = require("child_process");

const app = express();
app.use(express.json());

// MongoDB ulanish
mongoose.connect(
  "mongodb+srv://abdullayevsardor813:ZH69A0kHib7oulEq@cluster0.umq5rzl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/dernSupport",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

// Data base sxema
// Aplication
const submissionSchema = new mongoose.Schema({
  email: String,
  problemType: String,
  description: String,
  region: String,
  price: Number,
  status: String,
  estimatedCompletionTime: String,
  deviceName: String
});

// User
const emailSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String, // hashed password
    required: true,
  },
  time: {
    type: Date,
    default: Date.now,
  },
  personType: String,
  companyName: String,
  fname: String,
  lname: String,
});

// Manager
const managerSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const masterSchema = new mongoose.Schema({
  email: String,
  password: String,
});

//  Data baseda malumotlar yaratish
const Submission = mongoose.model("Submission", submissionSchema);
const Manager = mongoose.model("Manager", managerSchema);
const Email = mongoose.model("Email", emailSchema); // 👈 to‘g‘ri modelga saqladik
const Master = mongoose.model("Master", masterSchema); // 👈 to‘g‘ri modelga saqladik

function generatePassword(length = 10) {
  return crypto.randomBytes(length).toString("hex").slice(0, length);
}

// Email yuborish funksiyasi
const sendEmail = async (to, password, fname, lname) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "Siz uchun parol",
    text: `Xurmatli ${fname} ${lname} siz bergan ma'lumotlar asosida, e'lon yaratildi, e'lon holatini kormoqchi
    bolsangiz shaxsiya kabinetingizga kirsayz boladi. Sizn shaxsiy profilingizga kirish
    uchun malumotlaringiz.
    Email: ${to},
    Parol: ${password}`,
  };

 
  await transporter.sendMail(mailOptions);
  
};

const sendEmail2 = async (to, fname, lname) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "E`lon yaratildi",
    text: `Xurmatli mijoz, siz bergan ma'lumotlar asosida, e'lon yaratildi, e'lon holatini kormoqchi bolsangiz shaxsiya kabinetingizga kiring.`,
  };

  await transporter.sendMail(mailOptions);
};

const sendEmail3 = async (to, newPassword) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "Yangi parolingiz",
    html: `<p>Sizning yangi parolingiz: <strong>${newPassword}</strong></p>`,
  };

  await transporter.sendMail(mailOptions);
};

const sendEmail4 = async (to, newPassword) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "Royhatdan O`tish",
    html: `<p>Sizni ro'yhatdan otganingiz bilan tabriklaymiz. Profilga Kirish uchun email va parolingiz.
    Parol: <strong>${newPassword}</strong>
    Email: <strong>${to}</strong></p>`,
  };

  await transporter.sendMail(mailOptions);
};

const sendEmail5 = async (mailOptions) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  await transporter.sendMail(mailOptions);
};


// POST /api/submit
app.post("/api/submit", async (req, res) => {
  try {
    const {
      fname,
      lname,
      email,
      personType,
      companyName,
      problemType,
      description,
      region,
      price,
      status,
      estimatedCompletionTime,
      deviceName,
    } = req.body;

    let find_email 

    if(email == 'manager@techfix.com'){
      find_email = await Manager.findOne({ email });
    }else{
      find_email = await Email.findOne({email})
    }

    if(!find_email){
      // 1. Parol yaratish
      const gPassword = generatePassword();
      const hashedPassword = await bcrypt.hash(gPassword, 10);
      await sendEmail(email, gPassword, fname, lname);
      await Email.create({
        email,
        password: hashedPassword,
        personType,
        companyName,
        fname,
        lname,
      }); // yangisini saqlaymiz
    }else{
      await sendEmail2(
            email,
            fname,
            lname,
          );
    }

         

    


    // 3. Asosiy ma'lumotni saqlash (Submission)
    const submission = new Submission({
      email,
      problemType,
      description,
      region,
      price,
      status,
      estimatedCompletionTime,
      deviceName,
    });

    await submission.save();

  

    // 5. Javob
    res.status(201).json({
      message: "Email yuborildi va maʼlumotlar saqlandi!",
      reload: true,
    });

  } catch (err) {
    console.error("Xatolik:", err);
    res.status(500).json({ error: "Xatolik yuz berdi", details: err.message });
  }
});


// POST /api/login - parol tekshiradi
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Email.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Email topilmadi" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Parol noto‘g‘ri" });
    }

    // Hammasi to‘g‘ri
    res.status(200).json({ success: true, message: "Muvaffaqiyatli login", name: `${user.lname} ${user.fname}` });
  } catch (err) {
    console.error("Login xatosi:", err);
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
});


// GET Aplication 
app.get("/api/applications", async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: "Email talab qilinadi" });
    }

    const userSubmissions = await Submission.find({ email });
    res.status(200).json(userSubmissions);
  } catch (err) {
    console.error("Submissionlarni olishda xatolik:", err);
    res.status(500).json({ error: "Server xatosi", details: err.message });
  }
});

async function createDefaultManager() {
  const existing = await Manager.findOne({ email: "manager@techfix.com" });
  if (!existing) {
    const hashedPassword = await bcrypt.hash("manager123", 10);
    await Manager.create({
      email: "manager@techfix.com",
      password: hashedPassword,
    });
    console.log("Default manager created.");
  }
}

async function createDefaultMaster() {
  const existing = await Master.findOne({ email: "master@techfix.com" });
  if (!existing) {
    const hashedPassword = await bcrypt.hash("master123", 10);
    await Master.create({
      email: "master@techfix.com",
      password: hashedPassword,
    });
    console.log("Default master created.");
  }
}

async function createDefaultManager() {
  const existing = await Manager.findOne({ email: "manager@techfix.com" });
  if (!existing) {
    const hashedPassword = await bcrypt.hash("manager123", 10);
    await Manager.create({
      email: "manager@techfix.com",
      password: hashedPassword,
    });
    console.log("Default manager created.");
  }
}

createDefaultMaster()
createDefaultManager()
// 3. Login API
app.post("/api/manager-login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const manager = await Manager.findOne({ email });
    if (!manager) {
      return res.status(401).json({ success: false, message: "Email noto‘g‘ri" });
    }

    const isMatch = await bcrypt.compare(password, manager.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Parol noto‘g‘ri" });
    }

    res.status(200).json({ success: true, message: "Menejer muvaffaqiyatli kirdi" });
  } catch (err) {
    console.error("Manager login xatosi:", err);
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
});

app.post("/api/master-login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const manager = await Master.findOne({ email });
    if (!manager) {
      return res.status(401).json({ success: false, message: "Email noto‘g‘ri" });
    }

    const isMatch = await bcrypt.compare(password, manager.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Parol noto‘g‘ri" });
    }

    res.status(200).json({ success: true, message: "Master muvaffaqiyatli kirdi" });
  } catch (err) {
    console.error("Manager login xatosi:", err);
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
});

// All submission api
app.get("/api/all-submissions", async (req, res) => {
  try {
    const submissions = await Submission.find();

    // Statistikalarni hisoblash
    const total = submissions.length;
    const waiting = submissions.filter(s => s.status === "Kutilmoqda").length;
    const inProgress = submissions.filter(s => s.status === "Jarayonda").length;
    const completed = submissions.filter(s => s.status === "Tugallangan").length;

    res.status(200).json({
      success: true,
      stats: {
        total,
        waiting,
        inProgress,
        completed
      },
      data: submissions
    });

  } catch (err) {
    console.error("Arizalarni olishda xatolik:", err);
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
});

// Statistika API
app.get("/api/submission-stats", async (req, res) => {
  try {
    const submissions = await Submission.find();

    // Hududlar va muammolar bo‘yicha guruhlash
    const regionCounts = {};
    const problemCounts = {};

    // Statistikalar
    const total = submissions.length;
    const waiting = submissions.filter(s => s.status === "Kutilmoqda").length;
    const inProgress = submissions.filter(s => s.status === "Jarayonda").length;
    const completed = submissions.filter(s => s.status === "Tugallangan").length;

    submissions.forEach((s) => {
      regionCounts[s.region] = (regionCounts[s.region] || 0) + 1;
      problemCounts[s.problemType] = (problemCounts[s.problemType] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      stats: {
        total,
        waiting,
        inProgress,
        completed
      },
      regionStats: regionCounts,
      problemStats: problemCounts,
    });
  } catch (err) {
    console.error("Statistikani olishda xatolik:", err);
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
});

app.get("/api/all-users", async (req, res) => {
  try {
    const users = await Email.find(); // hamma userlarni olish
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    console.error("Foydalanuvchilarni olishda xatolik:", err);
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
});


// Yangi parol yaratish funksiyasi


app.post("/api/reset-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await Email.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "Bunday email topilmadi" });

    // Yangi parol yaratamiz
    const newPassword = generatePassword();

    // Parolni bcrypt bilan shifrlaymiz
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Yangi parolni saqlaymiz
    user.password = hashedPassword;
    await user.save();

    // Email orqali yuborish
    await sendEmail3(email, newPassword)

    res.json({ success: true,  message: "Yangi parol emailingizga yuborildi"});
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Serverda xatolik yuz berdi" });
  }
});

app.post("/api/register", async (req, res) => {
  const { firstName, lastName, userType, companyName, email } = req.body;

  try {
    // Email mavjudligini tekshirish
    const existingUser = await Email.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Bu email allaqachon ro‘yxatdan o‘tgan", success: 'no' });
    }

      const plainPassword = generatePassword();
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

   

    await Email.create({
      email,
      password: hashedPassword,
      personType: userType,
      companyName: companyName,
      fname: firstName,
      lname: lastName,
    });

    sendEmail4(email, plainPassword)


    res
      .status(201)
      .json({
        message: "Ro‘yxatdan o‘tish muvaffaqiyatli yakunlandi",
        success: true,
      });
  } catch (error) {
    console.error("Registratsiyada xatolik:", error);
    res.status(500).json({ message: "Serverda xatolik yuz berdi", success: false });
  }
});

app.post("/api/change-password", async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;

  try {
    const user = await Email.findOne({ email });

    if (!user)
      return res.status(404).json({ message: "Foydalanuvchi topilmadi." });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Joriy parol noto‘g‘ri." });

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ message: "Parol muvaffaqiyatli yangilandi."});
  } catch (err) {
    res.status(500).json({ message: "Server xatosi.", error: err.message });
  }
});

app.get("/api/master-applications", async (req, res) => {
  try {
    const submissions = await Submission.find();
    res.status(200).json(submissions);
  } catch (err) {
    console.error("Arizalarni olishda xatolik:", err);
    res.status(500).json({ error: "Server xatosi", details: err.message });
  }
});

app.post("/api/save-evaluation", async (req, res) => {
  try {
    const { applicationId, price, estimatedCompletionTime } = req.body;

    if (!applicationId || price == null || !estimatedCompletionTime) {
      return res
        .status(400)
        .json({ error: "Barcha maydonlar to‘ldirilishi shart" });
    }

    // Arizaning statusini tekshirish
    const submission = await Submission.findById(applicationId);
    if (!submission) {
      return res.status(404).json({ error: "Ariza topilmadi" });
    }
    if (submission.status === "Tugallangan") {
      return res
        .status(403)
        .json({ error: "Tugallangan arizani o‘zgartirib bo‘lmaydi" });
    }

    // Yangilash
    const updatedSubmission = await Submission.findByIdAndUpdate(
      applicationId,
      {
        price: Number(price),
        estimatedCompletionTime: new Date(estimatedCompletionTime),
        status: "Jarayonda",
      },
      { new: true }
    );

    res.status(200).json(updatedSubmission);
  } catch (err) {
    console.error("Baholashni saqlashda xato:", err);
    res.status(500).json({ error: "Server xatosi", details: err.message });
  }
});

// Confirm application
app.post("/api/confirm-application", async (req, res) => {
  try {
    const { applicationId } = req.body;

    const submission = await Submission.findByIdAndUpdate(
      applicationId,
      { status: "Tugallangan" },
      { new: true }
    );

    if (!submission) {
      return res.status(404).json({ error: "Application not found" });
    }

    // Send email to client
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: submission.email,
      subject: "Jarayoningiz tugallandi",
      text: `
        Hurmatli mijoz,
        
Sizning arizangiz (ID: ${applicationId.slice(-6)}) muvaffaqiyatli tugallandi.
Qurilma: ${submission.deviceName || submission.problemType}
Muammo: ${submission.problemType}
Narx: ${submission.price?.toFixed(2) || "N/A"} ming
Tugallash sanasi: ${new Date(submission.estimatedCompletionTime).toLocaleDateString() || "N/A"}

TechFix xizmatidan foydalanganingiz uchun rahmat!
      `,
    };

    sendEmail5(mailOptions)

    res.status(200).json(submission);
  } catch (err) {
    console.error("Error confirming application:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Statik fayllar uchun
app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend", "index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend", "login.html"));
});

app.get("/manager", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend", "manager-cabinet.html"));
});

app.get("/paroltiklash", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend", "parol-tiklash.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend", "registr.html"));
}); 

app.get("/client", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend", "client-cabinet.html"));
});

app.get("/master", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend", "master-cabinet.html"));
});

app.get("/privacy", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend", "privacy.html"));
});
  
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server ${PORT}-portda ishlayapti`);
});
